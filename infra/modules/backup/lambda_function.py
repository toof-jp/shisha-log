import os
import json
import boto3
import tempfile
import zstandard as zstd
from datetime import datetime
from urllib.parse import urlparse
import psycopg2
from psycopg2.extras import RealDictCursor

def get_table_names(cursor):
    """Get all table names from public schema"""
    cursor.execute("""
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY tablename
    """)
    return [row['tablename'] for row in cursor.fetchall()]

def export_table_schema(cursor, table_name):
    """Export CREATE TABLE statement for a table"""
    # Get table definition
    cursor.execute(f"""
        SELECT 
            'CREATE TABLE IF NOT EXISTS ' || quote_ident('{table_name}') || ' (' ||
            string_agg(
                quote_ident(column_name) || ' ' || 
                data_type || 
                CASE 
                    WHEN character_maximum_length IS NOT NULL 
                    THEN '(' || character_maximum_length || ')'
                    ELSE ''
                END ||
                CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
                CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
                ', '
            ) || ');' as create_statement
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '{table_name}'
        GROUP BY table_name
    """)
    result = cursor.fetchone()
    return result['create_statement'] if result else None

def export_table_data(cursor, table_name):
    """Export table data as INSERT statements"""
    cursor.execute(f"SELECT * FROM {table_name}")
    columns = [desc[0] for desc in cursor.description]
    
    inserts = []
    for row in cursor:
        values = []
        for col, val in zip(columns, row):
            if val is None:
                values.append('NULL')
            elif isinstance(val, (int, float)):
                values.append(str(val))
            elif isinstance(val, bool):
                values.append('TRUE' if val else 'FALSE')
            else:
                # Escape single quotes and wrap in quotes
                escaped = str(val).replace("'", "''")
                values.append(f"'{escaped}'")
        
        insert = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({', '.join(values)});"
        inserts.append(insert)
    
    return inserts

def handler(event, context):
    """
    Lambda function to backup PostgreSQL database to S3
    """
    database_url = os.environ['DATABASE_URL']
    s3_bucket = os.environ['S3_BUCKET']
    project_name = os.environ.get('PROJECT_NAME', 'shisha-log')
    environment = os.environ.get('ENVIRONMENT', 'prod')
    
    # Parse database URL
    parsed = urlparse(database_url)
    db_name = parsed.path[1:]  # Remove leading slash
    
    # Generate backup filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_filename = f"{project_name}_{environment}_{db_name}_{timestamp}.sql.zst"
    
    # Create temporary file for backup
    with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', delete=False, suffix='.sql') as tmp_file:
        tmp_path = tmp_file.name
        
        try:
            # Connect to database
            print(f"Starting backup of database: {db_name}")
            
            conn = psycopg2.connect(
                host=parsed.hostname,
                port=parsed.port or 5432,
                database=db_name,
                user=parsed.username,
                password=parsed.password,
                cursor_factory=RealDictCursor
            )
            
            cursor = conn.cursor()
            
            # Write SQL dump header
            tmp_file.write(f"-- PostgreSQL database dump\n")
            tmp_file.write(f"-- Generated by shisha-log backup Lambda\n")
            tmp_file.write(f"-- Date: {datetime.now().isoformat()}\n")
            tmp_file.write(f"-- Database: {db_name}\n\n")
            
            # Get all tables
            tables = get_table_names(cursor)
            print(f"Found {len(tables)} tables to backup")
            
            # Export each table
            for table_name in tables:
                print(f"Backing up table: {table_name}")
                
                # Write table comment
                tmp_file.write(f"\n-- Table: {table_name}\n")
                
                # Export schema
                schema_sql = export_table_schema(cursor, table_name)
                if schema_sql:
                    tmp_file.write(f"{schema_sql}\n\n")
                
                # Export data
                data_sql = export_table_data(cursor, table_name)
                if data_sql:
                    for insert in data_sql:
                        tmp_file.write(f"{insert}\n")
                
                tmp_file.write("\n")
            
            cursor.close()
            conn.close()
            
            print(f"SQL dump completed, compressing with zstd...")
            
            # Compress the SQL file with zstd
            zst_path = tmp_path + '.zst'
            cctx = zstd.ZstdCompressor(level=19)  # Max compression level for better efficiency
            with open(tmp_path, 'rb') as f_in:
                with open(zst_path, 'wb') as f_out:
                    f_out.write(cctx.compress(f_in.read()))
            
            file_size = os.path.getsize(zst_path)
            print(f"Backup compressed successfully with zstd, file size: {file_size} bytes")
            
            # Upload to S3
            s3_client = boto3.client('s3')
            s3_key = f"backups/{datetime.now().strftime('%Y/%m')}/{backup_filename}"
            
            print(f"Uploading backup to S3: s3://{s3_bucket}/{s3_key}")
            
            with open(zst_path, 'rb') as backup_file:
                s3_client.upload_fileobj(
                    backup_file,
                    s3_bucket,
                    s3_key,
                    ExtraArgs={
                        'ServerSideEncryption': 'AES256',
                        'ContentType': 'application/zstd',
                        'Metadata': {
                            'project': project_name,
                            'environment': environment,
                            'database': db_name,
                            'timestamp': timestamp,
                            'compression': 'zstd'
                        }
                    }
                )
            
            print(f"Backup uploaded successfully to S3")
            
            # Clean up compressed file
            os.unlink(zst_path)
            
            # Return success response
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Backup completed successfully',
                    'bucket': s3_bucket,
                    'key': s3_key,
                    'filename': backup_filename,
                    'size': file_size
                })
            }
            
        except Exception as e:
            print(f"Error during backup: {str(e)}")
            return {
                'statusCode': 500,
                'body': json.dumps({
                    'error': str(e)
                })
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
# DNS Configuration Guide

## Required DNS Records

For the Shisha Log application to work properly, you need to configure the following DNS records:

### 1. Frontend (Main Domain)

**For apex domain (e.g., shisha.toof.jp):**
- **Type**: CNAME or ALIAS
- **Name**: @ or shisha
- **Value**: CloudFront distribution domain (e.g., d1234567890.cloudfront.net)
- **TTL**: 300 seconds

**For subdomain (e.g., app.shisha.toof.jp):**
- **Type**: CNAME
- **Name**: app
- **Value**: CloudFront distribution domain
- **TTL**: 300 seconds

### 2. Backend API

- **Type**: A
- **Name**: api
- **Value**: Lightsail static IP address (e.g., 13.211.150.103)
- **TTL**: 300 seconds

### 3. Optional: WWW Redirect

- **Type**: CNAME
- **Name**: www
- **Value**: Same as main domain CloudFront distribution
- **TTL**: 300 seconds

## DNS Provider Examples

### Cloudflare
1. Log in to Cloudflare dashboard
2. Select your domain
3. Go to DNS settings
4. Add records as specified above
5. Set proxy status to "DNS only" (gray cloud) for CloudFront CNAME

### Route 53
If using Route 53, the Terraform configuration can manage these automatically:
```bash
cd infra
terraform apply -var use_route53=true
```

### Google Domains
1. Go to DNS settings for your domain
2. Add custom resource records
3. Use CNAME for subdomains
4. Use synthetic records for apex domain if needed

## Verification

After DNS propagation (usually 5-30 minutes), verify:

```bash
# Check frontend
dig shisha.toof.jp
curl -I https://shisha.toof.jp

# Check API
dig api.shisha.toof.jp
curl https://api.shisha.toof.jp/api/v1/health
```

## Troubleshooting

1. **DNS not resolving**: Wait for propagation (up to 48 hours in rare cases)
2. **SSL certificate errors**: Ensure ACM certificate includes all required domains
3. **API connection errors**: Check Lightsail security group allows HTTPS (443)
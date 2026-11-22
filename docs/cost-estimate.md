# TicketDesk AWS Cost Optimization & Budget Estimate

## 1. Cost Optimization Architectural Choices

As an internship evaluation POC, TicketDesk was intentionally architected to minimize operational cloud costs without compromising production-grade security:

1. **Elimination of NAT Gateways (Saves ~$32.85/month):**
   - By running the EC2 application host in the public subnet with tightly locked security groups and placing Amazon RDS in private subnets with local-only routes, we avoid the mandatory baseline fee of AWS NAT Gateways.
2. **AWS Graviton2 Processor for RDS (`db.t4g.micro`):**
   - Offers up to 40% better price/performance compared to x86 counterparts.
3. **Single-AZ Development Database:**
   - Evaluated as a single-AZ instance to avoid standby replica billing.
4. **Serverless Lambda File Processing:**
   - Paid only per invocation (128 MB RAM, ~300ms runtime), falling well within the AWS Free Tier (1M free requests/month).
5. **EBS gp3 Storage Volumes:**
   - gp3 is 20% less expensive per GB than gp2 while providing baseline 3,000 IOPS and 125 MB/s throughput.

---

## 2. Estimated Monthly Cloud Cost (US-East-1 N. Virginia)

*Note: Pricing is estimated based on current AWS public pricing (2024–2026 rates). If running within the AWS Free Tier during the first 12 months, actual net charges will be significantly lower.*

| AWS Service | Resource / Sizing | Usage / Month | Est. Monthly Cost (USD) | Free Tier Eligible |
|---|---|---|---|---|
| **Amazon EC2** | `t3.small` Linux Instance | 730 hours (full month) | ~$15.18 | Partially (t2/t3.micro free) |
| **Public IPv4** | In-use public IPv4 address | 730 hours ($0.005/hr) | ~$3.65 | No |
| **Amazon EBS** | 30 GB gp3 Root Volume | 30 GB-months | ~$2.40 | Up to 30 GB free |
| **Amazon RDS** | PostgreSQL `db.t4g.micro` (Single-AZ) | 730 hours | ~$12.41 | 750 hrs free in first year |
| **RDS Storage** | 20 GB gp3 Database Storage | 20 GB-months | ~$2.30 | 20 GB free in first year |
| **Amazon S3** | Standard Storage (< 1 GB attachments) | 1 GB + 5,000 PUT/GET | ~$0.05 | 5 GB free in first year |
| **AWS Lambda** | File Processor (128 MB RAM, < 1,000 events) | < 10,000 requests | $0.00 | 1M free forever |
| **CloudWatch** | Logs (< 1 GB ingestion) + 1 Dashboard | 1 GB log stream | ~$0.80 | 5 GB free forever |
| **Data Transfer**| Inbound / Outbound API traffic | < 5 GB | ~$0.45 | 100 GB outbound free |
| **Total Estimated Monthly Cost** | | | **~$37.24 / month** | **~$6.05 / mo under Free Tier** |

---

## 3. Estimated POC Evaluation Run Cost (7-Day Evaluation)

For an active evaluation period of **7 days (168 hours)**, the expected spend is:
$$\text{Estimated 7-Day Cost} \approx \frac{\$37.24}{30} \times 7 \approx \$8.69\text{ USD}$$

---

## 4. Teardown Procedure to Cease Billing

To immediately terminate all AWS charges after evaluation:
```bash
cd ticketdesk/terraform
terraform destroy -auto-approve
```
All EC2 instances, EBS volumes, RDS instances, S3 buckets, and Lambda functions will be permanently deleted.

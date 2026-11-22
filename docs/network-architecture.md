# Network Architecture & Security Groups Specification

## 1. VPC & Subnet Design

The network architecture separates the public compute tier from the private database tier.

```mermaid
graph TD
    subgraph "VPC: 10.0.0.0/16"
        IGW[Internet Gateway]
        
        subgraph "Public Route Table"
            PRT[Route: 0.0.0.0/0 -> IGW]
        end

        subgraph "Public Tier: Subnet 10.0.1.0/24 (AZ: us-east-1a)"
            EC2[TicketDesk EC2 Host<br/>Public IP Assigned]
        end

        subgraph "Private Route Table"
            PrivRT[Route: Local 10.0.0.0/16 Only<br/>NO IGW • NO Public Access]
        end

        subgraph "Private DB Tier across 2 Availability Zones"
            SubnetA[Subnet 10.0.10.0/24 (AZ: us-east-1a)<br/>RDS Primary Subnet]
            SubnetB[Subnet 10.0.11.0/24 (AZ: us-east-1b)<br/>RDS Multi-AZ Ready Subnet]
            RDS[(Amazon RDS PostgreSQL)]
        end
    end

    IGW --- PRT
    PRT --- EC2
    PrivRT --- SubnetA
    PrivRT --- SubnetB
    SubnetA --- RDS
    SubnetB --- RDS
    EC2 -->|PostgreSQL 5432| RDS
```

---

## 2. IP Addressing Scheme

| Subnet Name | CIDR Block | Availability Zone | Tier | Route Table Target |
|---|---|---|---|---|
| `public-subnet` | `10.0.1.0/24` | `us-east-1a` | Public | Internet Gateway (`igw-xxxx`) |
| `rds-subnet-a` | `10.0.10.0/24` | `us-east-1a` | Private DB | Local VPC Only (`10.0.0.0/16`) |
| `rds-subnet-b` | `10.0.11.0/24` | `us-east-1b` | Private DB | Local VPC Only (`10.0.0.0/16`) |

---

## 3. Security Group Rules Matrix

### EC2 Security Group (`ticketdesk-ec2-sg`)
| Direction | Protocol | Port Range | Source / Destination | Description |
|---|---|---|---|---|
| Inbound | TCP | 80 | `0.0.0.0/0` (or Admin CIDR) | Public HTTP Ingress for Nginx Gateway & React UI |
| Inbound | TCP | 443 | `0.0.0.0/0` (or Admin CIDR) | Public HTTPS Ingress |
| Inbound | TCP | 22 | Admin CIDR / Restricted | Optional SSH (SSM Session Manager preferred) |
| Outbound | ALL | ALL | `0.0.0.0/0` | Outbound access for package updates, S3, CloudWatch |

### RDS Security Group (`ticketdesk-rds-sg`)
| Direction | Protocol | Port Range | Source / Destination | Description |
|---|---|---|---|---|
| Inbound | TCP | 5432 | `ticketdesk-ec2-sg` ONLY | PostgreSQL traffic strictly from EC2 application |
| Outbound | ALL | ALL | `0.0.0.0/0` | Standard egress |

> [!IMPORTANT]
> The Amazon RDS PostgreSQL instance has `publicly_accessible = false` and its security group strictly references the EC2 Security Group ID (`source_security_group_id`), ensuring zero direct database access from the public internet.

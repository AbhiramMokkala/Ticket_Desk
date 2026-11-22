# CI/CD Pipeline & GitHub Actions Automation

TicketDesk implements Continuous Integration and Continuous Deployment using GitHub Actions.

---

## 1. Continuous Integration (`ci.yml`)

The CI workflow triggers on every push and pull request to the `main` branch.

### Jobs:
1. **Java Spring Boot Tests:** Sets up JDK 21 and runs `mvn clean test` (JUnit 5 & Mockito).
2. **.NET 8 Comment Service Tests:** Sets up .NET 8.0 and executes `dotnet test` (xUnit).
3. **Python FastAPI & Lambda Tests:** Sets up Python 3.12, installs dependencies, and runs `pytest` for the Attachment Service and Lambda File Processor.
4. **Frontend Lint & Tests:** Sets up Node.js 20, verifies TypeScript compilation (`tsc --noEmit`), and runs Vitest.
5. **Terraform Validation:** Verifies code formatting (`terraform fmt -check`) and validates provider configuration (`terraform validate`).

---

## 2. Continuous Deployment (`deploy.yml`)

The CD workflow triggers via `workflow_dispatch` for controlled evaluation deployments.

### Authentication via GitHub OIDC (No Static Keys)
TicketDesk uses AWS OpenID Connect (OIDC) to authenticate GitHub Actions directly with AWS IAM without storing permanent AWS Access Key IDs or Secret Access Keys in repository secrets.

### Configuring GitHub OIDC in AWS:
1. Create an AWS IAM Identity Provider for `token.actions.githubusercontent.com`.
2. Create an IAM Role (e.g., `GitHubActionsTicketDeskDeployRole`) with the following trust policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
         },
         "Action": "sts:AssumeRoleWithWebIdentity",
         "Condition": {
           "StringEquals": {
             "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
           },
           "StringLike": {
             "token.actions.githubusercontent.com:sub": "repo:<YOUR_GITHUB_USER>/<REPO>:*"
           }
         }
       }
     ]
   }
   ```
3. Store the Role ARN in GitHub Repository Secrets as `AWS_ROLE_TO_ASSUME`.

---

## 3. Required GitHub Secrets

| Secret Name | Description |
|---|---|
| `AWS_ROLE_TO_ASSUME` | IAM Role ARN for GitHub OIDC |
| `AWS_REGION` | Target AWS Region (e.g., `us-east-1`) |
| `EC2_INSTANCE_ID` | EC2 instance ID for SSM update commands |
| `APP_HOST_IP` | Public IP for post-deployment health verification probe |

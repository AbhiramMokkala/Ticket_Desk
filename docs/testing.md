# Automated Testing Strategy & Execution

TicketDesk features comprehensive automated test coverage across all architectural tiers.

---

## 1. Test Architecture Matrix

| Test Suite | Framework | Target Component | Coverage Focus |
|---|---|---|---|
| **Java Unit Tests** | JUnit 5, Mockito | Java Spring Boot | Registration, duplicate email rejection, login, ticket creation, RBAC authorization, dashboard stats |
| **.NET Unit Tests** | xUnit, Moq, EF InMemory | ASP.NET Core 8 | Comment creation, listing, unauthorized employee access rejection |
| **Python Unit Tests** | Pytest, FastAPI TestClient | FastAPI Attachment Service | Filename sanitization, extension validation, oversized rejection, local storage adapter |
| **Lambda Tests** | Pytest, unittest.mock | AWS Lambda Processor | S3 ObjectCreated event parsing, file size validation, CloudWatch logging |
| **Frontend Tests** | Vitest, React Testing Library | React / Vite UI | Status and priority badges, form components, responsive elements |
| **End-to-End Tests** | Playwright | Full System Integration | Complete user journeys (registration -> ticket creation -> assignment -> comments -> resolution) |

---

## 2. Running Automated Tests

### Java Backend Tests
```bash
cd backend/java-ticket-service
mvn clean test
```

### .NET Backend Tests
```bash
cd backend/dotnet-comment-service
dotnet test
```

### Python Backend Tests
```bash
cd backend/python-attachment-service
pytest -v
```

### Lambda Processor Tests
```bash
cd aws/lambda/file-processor
pytest test_lambda.py -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Playwright End-to-End Tests
Ensure local or AWS environment is running, then:
```bash
cd tests/e2e
npm install
npx playwright test
```

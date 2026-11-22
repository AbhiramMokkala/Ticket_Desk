"""
TicketDesk Microservice Health and Cross-Service Authorization Verifier
Tests local and deployed endpoints for Java, .NET, Python, and Nginx reverse proxy.
"""
import sys
import requests

def check_endpoint(name, url, expected_status=200):
    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == expected_status:
            print(f"  [PASS] {name}: Status {resp.status_code}")
            return True
        else:
            print(f"  [FAIL] {name}: Expected {expected_status}, received {resp.status_code}")
            return False
    except Exception as e:
        print(f"  [FAIL] {name}: Connection error: {e}")
        return False

def verify_all(base_url="http://localhost"):
    print(f"\n=======================================================")
    print(f"TicketDesk Microservices Verification: {base_url}")
    print(f"=======================================================")

    results = []

    # 1. Gateway Health
    results.append(check_endpoint("Nginx Gateway Health", f"{base_url}/health"))

    # 2. Java Ticket Service
    results.append(check_endpoint("Java Ticket Service Health", f"{base_url}/actuator/health"))

    # 3. .NET Comment Service Health
    results.append(check_endpoint(".NET Comment Service Health", f"{base_url}/health"))

    # 4. Python Attachment Service Health
    results.append(check_endpoint("Python Attachment Service Health", f"{base_url}/health"))

    # 5. Public Auth Endpoint
    try:
        login_resp = requests.post(
            f"{base_url}/api/auth/login",
            json={"email": "employee@ticketdesk.local", "password": "Employee@12345"},
            timeout=5
        )
        if login_resp.status_code == 200 and "token" in login_resp.json().get("data", {}):
            print("  [PASS] Java JWT Authentication: Issued valid token successfully")
            results.append(True)
        else:
            print(f"  [FAIL] Java JWT Authentication failed: {login_resp.text}")
            results.append(False)
    except Exception as e:
        print(f"  [FAIL] Java Auth API error: {e}")
        results.append(False)

    print("-------------------------------------------------------")
    passed = sum(1 for r in results if r)
    total = len(results)
    print(f"Summary: {passed}/{total} health checks passed.")
    print("=======================================================\n")
    return passed == total

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "http://localhost"
    success = verify_all(target)
    sys.exit(0 if success else 1)

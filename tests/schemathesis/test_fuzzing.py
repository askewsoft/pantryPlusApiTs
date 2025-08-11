# Fuzzing tests with Schemathesis
# These tests use property-based testing to discover edge cases and potential security issues

import pytest
import schemathesis
from schemathesis import from_uri
from hypothesis import settings, given, strategies as st
import json
import random
import string

# Load the API schema
schema = from_uri("http://localhost:3000/v1/swagger.json")

# Fuzzing strategies for malicious input
@st.composite
def sql_injection_payloads(draw):
    """Generate SQL injection test payloads"""
    return draw(st.one_of([
        st.just("' OR 1=1 --"),
        st.just("'; DROP TABLE users; --"),
        st.just("' UNION SELECT * FROM users --"),
        st.just("' OR '1'='1"),
        st.just("'; INSERT INTO users VALUES ('hacker', 'password'); --"),
        st.just("' OR 1=1#"),
        st.just("' OR 1=1/*"),
    ]))

@st.composite
def xss_payloads(draw):
    """Generate XSS test payloads"""
    return draw(st.one_of([
        st.just("<script>alert('XSS')</script>"),
        st.just("<img src=x onerror=alert('XSS')>"),
        st.just("javascript:alert('XSS')"),
        st.just("<svg onload=alert('XSS')>"),
        st.just("'><script>alert('XSS')</script>"),
        st.just("';alert('XSS');//"),
    ]))

@st.composite
def path_traversal_payloads(draw):
    """Generate path traversal test payloads"""
    return draw(st.one_of([
        st.just("../../../etc/passwd"),
        st.just("..\\..\\..\\windows\\system32\\config\\sam"),
        st.just("....//....//....//etc/passwd"),
        st.just("%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd"),
        st.just("..%252f..%252f..%252fetc%252fpasswd"),
    ]))

@st.composite
def command_injection_payloads(draw):
    """Generate command injection test payloads"""
    return draw(st.one_of([
        st.just("; ls -la"),
        st.just("| cat /etc/passwd"),
        st.just("&& rm -rf /"),
        st.just("; whoami"),
        st.just("| id"),
        st.just("; echo 'hacked'"),
    ]))

# Test SQL injection vulnerabilities
@schema.parametrize()
@settings(max_examples=50, deadline=3000)
def test_sql_injection_fuzzing(case):
    """Test for SQL injection vulnerabilities"""
    # Inject SQL payloads into string fields
    if case.body:
        for key, value in case.body.items():
            if isinstance(value, str) and len(value) > 0:
                case.body[key] = sql_injection_payloads().example()
    
    response = case.call()
    
    # Check for SQL errors in response
    if response.status_code == 500:
        response_text = response.text.lower()
        sql_errors = [
            "sql", "mysql", "syntax error", "mysql error",
            "you have an error in your sql syntax",
            "mysql_fetch_array", "mysql_num_rows"
        ]
        
        # If we get SQL errors, it might indicate a vulnerability
        if any(error in response_text for error in sql_errors):
            pytest.fail(f"Potential SQL injection vulnerability detected: {response.text}")

# Test XSS vulnerabilities
@schema.parametrize()
@settings(max_examples=30, deadline=3000)
def test_xss_fuzzing(case):
    """Test for XSS vulnerabilities"""
    # Inject XSS payloads into string fields
    if case.body:
        for key, value in case.body.items():
            if isinstance(value, str) and len(value) > 0:
                case.body[key] = xss_payloads().example()
    
    response = case.call()
    
    # Check if XSS payload is reflected in response
    if response.status_code in [200, 201]:
        response_text = response.text
        xss_payloads_list = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "javascript:alert('XSS')"
        ]
        
        for payload in xss_payloads_list:
            if payload in response_text:
                pytest.fail(f"Potential XSS vulnerability detected: {payload} found in response")

# Test path traversal vulnerabilities
@schema.parametrize()
@settings(max_examples=20, deadline=3000)
def test_path_traversal_fuzzing(case):
    """Test for path traversal vulnerabilities"""
    # Inject path traversal payloads into path parameters
    if case.path_parameters:
        for key, value in case.path_parameters.items():
            case.path_parameters[key] = path_traversal_payloads().example()
    
    response = case.call()
    
    # Check for sensitive file content in response
    if response.status_code == 200:
        response_text = response.text.lower()
        sensitive_patterns = [
            "root:", "bin:", "daemon:", "sys:", "adm:",
            "mysql:", "postgres:", "apache:", "nginx:"
        ]
        
        if any(pattern in response_text for pattern in sensitive_patterns):
            pytest.fail(f"Potential path traversal vulnerability detected: {response.text}")

# Test command injection vulnerabilities
@schema.parametrize()
@settings(max_examples=20, deadline=3000)
def test_command_injection_fuzzing(case):
    """Test for command injection vulnerabilities"""
    # Inject command payloads into string fields
    if case.body:
        for key, value in case.body.items():
            if isinstance(value, str) and len(value) > 0:
                case.body[key] = command_injection_payloads().example()
    
    response = case.call()
    
    # Check for command execution results
    if response.status_code == 200:
        response_text = response.text.lower()
        command_outputs = [
            "root", "bin", "daemon", "sys", "adm",
            "total", "drwx", "-rwx", "rwxr-xr-x"
        ]
        
        if any(output in response_text for output in command_outputs):
            pytest.fail(f"Potential command injection vulnerability detected: {response.text}")

# Test buffer overflow attempts
@st.composite
def buffer_overflow_payloads(draw):
    """Generate buffer overflow test payloads"""
    return draw(st.one_of([
        st.just("A" * 1000),  # Large string
        st.just("A" * 10000),  # Very large string
        st.just("A" * 100000),  # Extremely large string
        st.just("".join(random.choices(string.ascii_letters, k=5000))),
        st.just("".join(random.choices(string.digits, k=5000))),
    ]))

@schema.parametrize()
@settings(max_examples=20, deadline=5000)
def test_buffer_overflow_fuzzing(case):
    """Test for buffer overflow vulnerabilities"""
    # Inject large payloads into string fields
    if case.body:
        for key, value in case.body.items():
            if isinstance(value, str):
                case.body[key] = buffer_overflow_payloads().example()
    
    response = case.call()
    
    # Check for crashes or memory issues
    if response.status_code == 500:
        response_text = response.text.lower()
        crash_indicators = [
            "segmentation fault", "stack overflow", "buffer overflow",
            "memory", "stack", "heap", "corruption"
        ]
        
        if any(indicator in response_text for indicator in crash_indicators):
            pytest.fail(f"Potential buffer overflow vulnerability detected: {response.text}")

# Test authentication bypass attempts
@st.composite
def auth_bypass_payloads(draw):
    """Generate authentication bypass test payloads"""
    return draw(st.one_of([
        st.just(""),  # Empty token
        st.just("null"),  # Null token
        st.just("undefined"),  # Undefined token
        st.just("admin"),  # Simple admin token
        st.just("true"),  # Boolean token
        st.just("1"),  # Numeric token
        st.just("Bearer"),  # Incomplete Bearer token
        st.just("Bearer "),  # Empty Bearer token
        st.just("Basic YWRtaW46YWRtaW4="),  # admin:admin in base64
        st.just("JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"),  # Valid JWT format
    ]))

@schema.parametrize()
@settings(max_examples=30, deadline=3000)
def test_auth_bypass_fuzzing(case):
    """Test for authentication bypass vulnerabilities"""
    # Test with various authentication bypass attempts
    if "Authorization" in case.headers:
        case.headers["Authorization"] = auth_bypass_payloads().example()
    
    response = case.call()
    
    # Check if we got unauthorized access
    if response.status_code == 200 and case.headers.get("Authorization") in ["", "null", "undefined", "admin", "true", "1"]:
        pytest.fail(f"Potential authentication bypass vulnerability detected with token: {case.headers.get('Authorization')}")

# Test rate limiting and DoS attempts
@st.composite
def dos_payloads(draw):
    """Generate DoS test payloads"""
    return draw(st.one_of([
        st.just({"nested": {"deep": {"object": {"with": {"many": {"levels": "value"}}}}}}),  # Deep nested object
        st.just([1] * 1000),  # Large array
        st.just({"key": "A" * 10000}),  # Large string value
        st.just({"array": list(range(1000))}),  # Large numeric array
    ]))

@schema.parametrize()
@settings(max_examples=10, deadline=10000)
def test_dos_fuzzing(case):
    """Test for DoS vulnerabilities"""
    # Inject DoS payloads into request body
    if case.body:
        case.body = dos_payloads().example()
    
    response = case.call()
    
    # Check for timeouts or crashes
    if response.status_code == 500:
        response_text = response.text.lower()
        dos_indicators = [
            "timeout", "memory", "stack", "heap", "overflow",
            "too many", "limit exceeded", "resource"
        ]
        
        if any(indicator in response_text for indicator in dos_indicators):
            pytest.fail(f"Potential DoS vulnerability detected: {response.text}") 
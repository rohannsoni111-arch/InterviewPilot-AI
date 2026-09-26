import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_execute_python_code():
    code = """
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

print(two_sum([2, 7, 11, 15], 9))
"""
    response = client.post("/api/v1/code/execute", json={
        "code": code,
        "language": "python"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["stdout"] == "[0, 1]"
    assert data["data"]["executionTimeMs"] >= 0

def test_execute_python_with_test_cases():
    code = """
import sys
line = sys.stdin.read().strip()
if line:
    nums = [int(x) for x in line.split()]
    print(sum(nums))
"""
    response = client.post("/api/v1/code/execute", json={
        "code": code,
        "language": "python",
        "testCases": [
            {"id": "tc-1", "input": "1 2 3", "expectedOutput": "6"},
            {"id": "tc-2", "input": "10 20", "expectedOutput": "30"}
        ]
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["allPassed"] is True
    assert len(data["data"]["testResults"]) == 2

def test_execute_sql_query():
    sql = "SELECT name, department, salary FROM employees WHERE salary >= 130000 ORDER BY salary DESC;"
    response = client.post("/api/v1/code/execute", json={
        "code": sql,
        "language": "sql"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Alice" in data["data"]["stdout"]
    assert "Charlie" in data["data"]["stdout"]

def test_code_review_analysis():
    code = """
def find_duplicate(nums):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                return nums[i]
    return -1
"""
    response = client.post("/api/v1/code/review", json={
        "code": code,
        "language": "python",
        "problemContext": "Find duplicate number in array"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["verdict"] == "needs_improvement"
    assert data["data"]["timeComplexity"] == "O(n²)"
    assert len(data["data"]["keyInsights"]) > 0

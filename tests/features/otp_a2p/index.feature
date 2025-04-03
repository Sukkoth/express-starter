Feature: Test API Endpoints

  Scenario: Verify root endpoint returns a welcome message
    Given the server is running 
    When I send a GET request to the root '/'
    Then the response status code should be 200
    Then the response body should be "Hello, Welcome"

  Scenario: Verify POST /api/v2/a2p returns message and id
    Given the server is running
    When I send a POST request to '/api/v2/a2p' with valid JWT authorization
    Then the a2p response status code should be 200
    Then the response body should contain 'message' as 'message queued successfully'
    Then the response body should contain 'id' as '1234567890'

  Scenario: Verify POST /api/v2/otp returns message and id
    Given the server is running
    When I send a POST request to '/api/v2/otp' with valid JWT authorization
    Then the otp verification response status code should be 200
    Then the response body should contain 'message' as 'OTP message queued successfully'
    Then the response body should contain 'id' as '1234567890'

  Scenario: Verify POST /api/v2/otp/verify returns message
    Given the server is running
    When I send a POST request to "/api/v2/otp/verify" with valid JWT authorization
    Then the response status code should be 200
    Then the response body should contain 'message' as 'OTP is valid'

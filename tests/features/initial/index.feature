Feature: Iniatial Test for the project
  Scenario: Open the root route
    Given I navigate to the '/' 
    Then the response status should be 200
    Then I should see message containing 'Hello, Welcome'
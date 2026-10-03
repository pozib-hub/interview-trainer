# Необходимо реализовать функцию expect,

Необходимо реализовать функцию expect, 
  которая будет принимать значение и обеспечивать два метода для проверки: toBe, 
  проверяющий строгое равенство и возвращающий {"value": true} при совпадении или выбрасывающий ошибку "Not Equal", 
  если значения не равны, и notToBe, проверяющий, что значения не равны и возвращающий {"value": true}, если они не равны, 
  или выбрасывающий ошибку "Equal", если они совпадают.

  Input: func = () => expect (5).toBe(5)
  Output: {"value": true}
  Explanation: 5 === 5 so this expression returns true.
  Input: func = () => expect (5).toBe(null)
  Output: {"error": "Not Equal"}
  Explanation: 5 !== null so this expression throw the error "Not Equal".
  Input: func = () => expect (5).notToBe(null)
  Output: {"value": true} I
  Explanation: 5 !== null so this expression returns true.

/*
 *  用户
 *
 */

import { getRequest, postRequest } from '/src/lib/axios';

export const employeeApi = {
  /**
   * 查询所有用户 @author 卓大
   */
  queryAll: () => {
    return getRequest('/employee/queryAll');
  },
  /**
   * 用户管理查询
   */
  queryEmployee: (params) => {
    return postRequest('/employee/query', params);
  },
  /**
   * 添加用户
   */
  addEmployee: (params) => {
    return postRequest('/employee/add', params);
  },
  /**
   * 更新用户信息
   */
  updateEmployee: (params) => {
    return postRequest('/employee/update', params);
  },
  /**
   * 删除用户
   */
  deleteEmployee: (employeeId) => {
    return getRequest(`/employee/delete/${employeeId}`);
  },
  /**
   * 批量删除用户
   */
  batchDeleteEmployee: (employeeIdList) => {
    return postRequest('/employee/update/batch/delete', employeeIdList);
  },
  /**
   * 批量调整用户部门
   */
  batchUpdateDepartmentEmployee: (updateParam) => {
    return postRequest('/employee/update/batch/department', updateParam);
  },
  /**
   * 重置用户密码
   */
  resetPassword: (employeeId) => {
    return getRequest(`/employee/update/password/reset/${employeeId}`);
  },
  /**
   * 修改面面
   */
  updateEmployeePassword: (param) => {
    return postRequest('/employee/update/password', param);
  },
  /**
   * 更新用户禁用状态
   */
  updateDisabled: (employeeId) => {
    return getRequest(`/employee/update/disabled/${employeeId}`);
  },

  /**
   * 查询用户-根据部门id
   */
  queryEmployeeByDeptId: (departmentId) => {
    return getRequest(`/employee/query/dept/${departmentId}`);
  },
};

import * as UserModel from "../models/user.model";
import type {
  CreateUserInput,
  UpdateUserInput,
} from "../models/user.model";

export const getAllUsers = () => UserModel.getAllUsers();
export const getUserById = (id: number) => UserModel.getUserById(id);
export const getUserByEmail = (email: string) =>
  UserModel.getUserByEmail(email);
export const createUser = (data: CreateUserInput) =>
  UserModel.createUser(data);
export const updateUser = (id: number, data: UpdateUserInput) =>
  UserModel.updateUser(id, data);
export const deleteUser = (id: number) => UserModel.deleteUser(id);

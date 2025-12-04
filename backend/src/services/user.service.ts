import bcrypt from "bcryptjs";
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
export const updateUser = async (id: number, data: UpdateUserInput & { password?: string }) => {
  // passwordフィールドが来た場合は、ハッシュ化してpasswordに設定
  const updateData: UpdateUserInput = { ...data };
  if (data.password) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    updateData.password = hashedPassword;
  }
  return UserModel.updateUser(id, updateData);
};
export const deleteUser = (id: number) => UserModel.deleteUser(id);

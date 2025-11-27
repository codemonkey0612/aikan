import { Router } from "express";
import * as SalaryController from "../controllers/salary.controller";

const router = Router();

router.get("/", SalaryController.getAllSalaries);
router.get("/:id", SalaryController.getSalaryById);
router.post("/", SalaryController.createSalary);
router.put("/:id", SalaryController.updateSalary);
router.delete("/:id", SalaryController.deleteSalary);

export default router;


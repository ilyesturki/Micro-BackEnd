import { body, param, query } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware";
import {
  paramsSanitizer,
  querySanitizer,
  bodySanitizer,
} from "../../middlewares/sanitizer";
import User from "../../models/User";
import bcrypt from "bcrypt";
import { RequestHandler } from "express";

export const updateLoggedUserValidator = [
  paramsSanitizer("id"),
  bodySanitizer("image"),
  param("id").notEmpty().withMessage("id is required"),
  body("image").optional().isString().withMessage("image must be a string"),

  validatorMiddleware,
];
export const deleteLoggedUserValidator = [
  paramsSanitizer("id"),
  bodySanitizer("password"),
  param("id").notEmpty().withMessage("id is required"),
  body("password")
    .optional()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/,
      "i"
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long"
    ),

  validatorMiddleware,
];
export const getLoggedUserValidator: RequestHandler[] = [
  paramsSanitizer("id"),
  param("id").notEmpty().withMessage("id is required"),
  validatorMiddleware,
];

export const createUserValidator = [
  bodySanitizer(
    "firstName",
    "lastName",
    "email",
    "phone",
    "image"
  ),
  body("firstName")
    .notEmpty()
    .withMessage("firstName is required")
    .isLength({ min: 3 })
    .withMessage("Too short firstName")
    .isLength({ max: 20 })
    .withMessage("too long firstName"),
  body("lastName")
    .notEmpty()
    .withMessage("lastName is required")
    .isLength({ min: 3 })
    .withMessage("Too short lastName")
    .isLength({ max: 20 })
    .withMessage("too long lastName"),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid email address"),
  body("phone")
    .notEmpty()
    .withMessage("phone is required")
    .isMobilePhone(["ar-TN"])
    .withMessage("Invalid phone number only accepted TN Phone numbers"),
  body("image").optional().isString().withMessage("image must be a string"),
  validatorMiddleware,
];
export const updateUserValidator = [
  paramsSanitizer("id"),
  bodySanitizer(
    "firstName",
    "lastName",
    "email",
    "phone",
    "image"
  ),
  body("firstName")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short firstName")
    .isLength({ max: 20 })
    .withMessage("too long firstName"),
  body("lastName")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short lastName")
    .isLength({ max: 20 })
    .withMessage("too long lastName"),
  body("email").optional().isEmail().withMessage("Invalid email address"),
  body("phone")
    .optional()
    .isMobilePhone(["ar-TN"])
    .withMessage("Invalid phone number only accepted TN Phone numbers"),

  body("image").optional().isString().withMessage("image must be a string"),
  validatorMiddleware,
];
export const updatePasswordValidator = [
  paramsSanitizer("id"),
  bodySanitizer("password", "passwordConfirm"),
  param("id").notEmpty().withMessage("id is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/,
      "i"
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long"
    ),
  validatorMiddleware,
];
export const deleteUserValidator = [
  paramsSanitizer("id"),
  param("id").notEmpty().withMessage("id is required"),
  validatorMiddleware,
];
export const getUserValidator = [
  paramsSanitizer("id"),
  param("id").notEmpty().withMessage("id is required"),
  validatorMiddleware,
];
export const getAllValidator = [
  querySanitizer("page", "limit", "sort", "fields", "keyword"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
  query("sort").optional().isString().withMessage("Sort must be a string"),
  query("fields").optional().isString().withMessage("Fields must be a string"),
  query("keyword")
    .optional()
    .isString()
    .withMessage("Keyword must be a string"),
  validatorMiddleware,
];

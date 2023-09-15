import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import expressAsyncHandler from "express-async-handler";
import { createActivationToken } from "../utils/activationToken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import jwt from "jsonwebtoken";

// register a user
interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}
export const registerUser = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const isUserExist = await userModel.findOne({ email });
      if (isUserExist) {
        return next(new ErrorHandler("Email already in use", 400));
      }
      const user: IRegistrationBody = {
        name,
        email,
        password,
      };
      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activationCode;
      const data = { user: { name: user.name }, activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activation-mail.ejs"),
        data
      );

      try {
        await sendMail({
          email: user.email,
          subject: "Activate Your Account",
          template: "activation-mail.ejs",
          data,
        });
        res.status(200).json({
          success: true,
          message: "Check your mail to activate your account",
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// activate user
interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activateUser = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as IActivationRequest;

      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
      ) as { user: IUser; activationCode: string };
      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }

      const { name, email, password } = newUser.user;
      const existUser = await userModel.findOne({ email });
      if (existUser) {
        return next(new ErrorHandler("Email already in use", 400));
      }
      const user = await userModel.create({
        name,
        email,
        password,
      });
      res.status(201).json({ success: true, user });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// login the user
interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;
      if (!email && !password) {
        return next(new ErrorHandler("All fields are required", 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

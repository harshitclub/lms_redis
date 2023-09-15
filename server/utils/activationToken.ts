require("dotenv").config();
import jwt, { Secret } from "jsonwebtoken";

const activation_secret = process.env.ACTIVATION_SECRET;

interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    activation_secret as Secret,
    {
      expiresIn: "5m",
    }
  );
  return { token, activationCode };
};

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "NightIsAlwaysBetter101";


export const generateToken = (userID: string) => {
    return jwt.sign({userID}, JWT_SECRET, {expiresIn: "7D"})
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET);
}
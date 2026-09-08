const {z}=require('zod');
const loginSchema=z.object({identifier:z.string().min(3),password:z.string().min(8)});
const refreshTokenSchema=z.object({refreshToken:z.string().min(1)});
module.exports={loginSchema,refreshTokenSchema};

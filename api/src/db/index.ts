import mongoose from "mongoose";

const dbConnection = async () => {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error("Missing DATABASE_URL in environment variables");
        }
        
        const connection = await mongoose.connect(process.env.DATABASE_URL);
        console.log("DB Connected Successfully");
        
    } catch (error) {
        console.log("DB Error: ", error);
    }
};

export default dbConnection;
import mongoose from "mongoose";


export const Connectdb = async () => {
    await mongoose.connect(`${process.env.MONGODB_URI}/feasto`).then(()=>console.log("Database Connected"))
}
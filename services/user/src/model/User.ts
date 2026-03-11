// Defines the MongoDB user schema and model for the user service.
import mongoose, {Document, Schema} from "mongoose";    

export interface IUser extends Document{
    
    name: string,
    email: string,
    image: string,
    instagram: string,
    linedin : string,
    bio : string
    
}

const schema : Schema<IUser>= new Schema ({

    name : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
        unique : true,
    },
    image : {
        type : String,
    },
    instagram : {
        type : String,
        // required : true,
    },
    linedin : {
        type : String,
        // required : true,
    },
    bio : {
        type : String,
        // required : true,
    },
   
},{timestamps : true});

const User = mongoose.model<IUser>("User",schema)

export default User;
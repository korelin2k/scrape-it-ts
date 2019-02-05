import { Document, model, Schema } from "mongoose";
import { SchemaDef } from "../../types";

interface NFL {
    headLine: string;
    url: string;
    picture: string;
    comments: string[];
}

// Declare the model interface
interface NFLDoc extends NFL, Document { };

const NFLSchemaDef: SchemaDef<NFL> = {
    headLine: {
        type: String,
        unique: true,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: false
    },
    comments: {
        type: [String],
        required: false,
        default: undefined
    },
};

// Declare the model schema
const NFLSchema = new Schema(NFLSchemaDef);

// Define some public methods for our model
class NFLClass {
    private headLine: string;
    private url: string;
    private picture: string;
    private comments: string[];
}

// Important! Don't forget to use loadClass so your new methods will be included in the model
NFLSchema.loadClass(NFLClass);

export default model<NFLDoc>("NFL", NFLSchema);

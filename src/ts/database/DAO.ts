import { Database } from "sqlite3";
import { initDB } from "./database";

export class DAO{
    private db : Database;

    constructor(db : Database){
        this.db = db;
    }

    
}
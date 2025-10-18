import { applyDecorators, UseGuards } from "@nestjs/common";
import { RolesGuard } from "../roles.guard";
import { PrismaService } from "src/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

export function Roles(...roles:string[]){
    return applyDecorators(
        UseGuards(new(class extends RolesGuard{
            constructor(){
                super(new JwtService(),new PrismaService(),new ConfigService())
            }
        })())
    )
}
import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/prisma";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const messageRouter = createTRPCRouter({
    getMany : protectedProcedure
    .input(
      z.object({
          projectId : z.string().min(1,{ message : "Project ID is required"})
      })
    )
    .query(async ({input , ctx}) => {
        const messages = await prisma.message.findMany({
            where : {
              projectId : input.projectId,
              project : {
                userId : ctx.auth.userId,
              }
            },
            include : {
              fragment : true
            },
              orderBy : {
                updatedAt : "asc"
            }
        })

        return messages;
    }),
    
    create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "value is mandatory" })
          .max(10000, { message: "The value is too long" }),
          projectId : z.string().min(1,{ message : "Project ID is required"})
      })
    )
    .mutation(async ({ input, ctx }) => {

       const existingProject = await prisma.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.auth.userId,
        },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

       const createdMessages = await prisma.message.create({
            data : {
                projectId : existingProject.id,
                content : input.value,
                role : "USER",
                type : "RESULT"
            },
        });

    await inngest.send({
        name : "code-agent/run",
        data : {
            value : input.value,
            projectId : input.projectId
        }
    })
    
    return createdMessages;
    })  
})
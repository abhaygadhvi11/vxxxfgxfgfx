// import { validate } from "../../../lib/validation/validator";
// import {
//   updateTask,
//   deleteTask,
//   getTaskById,
// } from "../../../lib/services/taskService";
// import { updateTaskSchema } from "../../../lib/validation/task";
// import { authenticate } from "../../../lib/auth";

// async function handler(req, res) {
//   const { id } = req.query;
//   const user = req.user;

//   try {
//     const task = await getTaskById(id);
//     if (!task) {
//       return res.status(404).json({ error: "Task not found" });
//     }

//     const isCreator = task.createdById === user.id;
//     const isAssignee = task.assignedToId === user.id;

//     if (!isCreator && !isAssignee) {
//       return res
//         .status(403)
//         .json({ error: "Unauthorized access to this task" });
//     }

//     // GET: both creator and assignee
//     if (req.method === "GET") {
//       return res.status(200).json({ success: true, task });
//     }

//     // PUT: allow both, but assignee only for status
//     if (req.method === "PUT") {
//       if (isAssignee && !isCreator) {
//         const allowedFields = ["status"];
//         const requestKeys = Object.keys(req.body);
//         const hasOnlyAllowed = requestKeys.every((key) =>
//           allowedFields.includes(key)
//         );

//         if (!hasOnlyAllowed) {
//           return res.status(403).json({
//             error: "You can only update the task status",
//           });
//         }
//         req.body = { status: req.body.status };
//       }

//       const errors = validate(updateTaskSchema, req.body);
//       if (errors) {
//         return res.status(400).json({ success: false, errors });
//       }

//       const updated = await updateTask(id, req.body);
//       return res.status(200).json({ success: true, task: updated });
//     }

//     // DELETE: only creator
//     if (req.method === "DELETE") {
//       if (!isCreator) {
//         return res.status(403).json({
//           error: "Only the creator can delete this task",
//         });
//       }

//       await deleteTask(id);
//       return res.status(200).json({
//         success: true,
//         message: "Task deleted successfully",
//       });
//     }

//     return res.status(405).json({ error: "Method not allowed" });
//   } catch (error) {
//     console.error("Task operation failed:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// }

// export default authenticate(handler);


import { validate } from "../../../lib/validation/validator";
import {
  updateTask,
  deleteTask,
  getTaskById,
} from "../../../lib/services/taskService";
import { updateTaskSchema } from "../../../lib/validation/task";
import { authenticate } from "../../../lib/auth";

export default async function handler(req, res) {
  try {
    // ✅ Perform authentication inside the function
    await new Promise((resolve, reject) => {
      authenticate(req, res, (err) => (err ? reject(err) : resolve()));
    });
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.query;
  const user = req.user;

  try {
    const task = await getTaskById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const isCreator = task.createdById === user.id;
    const isAssignee = task.assignedToId === user.id;

    if (!isCreator && !isAssignee) {
      return res.status(403).json({ error: "Unauthorized access to this task" });
    }

    // GET: both creator and assignee
    if (req.method === "GET") {
      return res.status(200).json({ success: true, task });
    }

    // PUT: allow both, but assignee only for status
    if (req.method === "PUT") {
      if (isAssignee && !isCreator) {
        const allowedFields = ["status"];
        const requestKeys = Object.keys(req.body);
        const hasOnlyAllowed = requestKeys.every((key) =>
          allowedFields.includes(key)
        );

        if (!hasOnlyAllowed) {
          return res.status(403).json({
            error: "You can only update the task status",
          });
        }

        req.body = { status: req.body.status };
      }

      const errors = validate(updateTaskSchema, req.body);
      if (errors) {
        return res.status(400).json({ success: false, errors });
      }

      const updated = await updateTask(id, req.body);
      return res.status(200).json({ success: true, task: updated });
    }

    // DELETE: only creator
    if (req.method === "DELETE") {
      if (!isCreator) {
        return res.status(403).json({
          error: "Only the creator can delete this task",
        });
      }

      await deleteTask(id);
      return res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Task operation failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

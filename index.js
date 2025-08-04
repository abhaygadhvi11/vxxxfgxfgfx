// // import { createTaskSchema } from "../../../lib/validation/task";
// // import { validate } from "../../../lib/validation/validator";
// // import {
// //   createTask,
// //   getFilteredTasks,
// // } from "../../../lib/services/taskService";
// // import { authenticate } from "../../../lib/auth";

// // async function handler(req, res) {
// //   const user = req.user;
// //   try {
// //     // Create Task
// //     if (req.method === "POST") {
// //       try {
// //         const errors = validate(createTaskSchema, req.body);
// //         if (errors) return res.status(400).json({ success: false, errors });
// //         const taskData = { ...req.body, createdById: user.id };
// //         const task = await createTask(taskData);
// //         return res.status(201).json({ success: true, data: task });
// //       } catch (error) {
// //         console.error("Create task error:", error);
// //         return res.status(500).json({ message: "Server error" });
// //       }
// //     }

// //     // Return Task List
// //     if (req.method === "GET") {
// //       try {
// //         // Parse filters from query parameters
// //         const filters = parseFilters(req.query);

// //         // Validate filters
// //         const filterErrors = validateFilters(filters);
// //         if (filterErrors.length > 0) {
// //           return res.status(400).json({
// //             success: false,
// //             error: "Invalid filters",
// //             details: filterErrors,
// //           });
// //         }

// //         // Get filtered tasks
// //         const result = await getFilteredTasks(filters);
// //         return res.status(201).json(result);
// //       } catch (error) {
// //         console.error(error);
// //         return res
// //           .status(501)
// //           .json({ error: "Failed to fetch filtered tasks" });
// //       }
// //     }
// //   } catch (error) {
// //     console.error(error);
// //     return res.status(501).json({ error: "Internal Error" });
// //   }
// // }

// // // Parse filters from query parameters
// // function parseFilters(query) {
// //   return {
// //     // Basic filters
// //     status: query.status
// //       ? Array.isArray(query.status)
// //         ? query.status
// //         : query.status.split(",")
// //       : null,
// //     priority: query.priority
// //       ? Array.isArray(query.priority)
// //         ? query.priority
// //         : query.priority.split(",")
// //       : null,
// //     assignedToId: query.assignedToId
// //       ? Array.isArray(query.assignedToId)
// //         ? query.assignedToId
// //         : query.assignedToId.split(",")
// //       : null,
// //     projectId: query.projectId
// //       ? Array.isArray(query.projectId)
// //         ? query.projectId
// //         : query.projectId.split(",")
// //       : null,
// //     createdById: query.createdById || null,

// //     unassigned: query.unassigned === "true",
// //     overdue: query.overdue === "true",
// //     dueSoon: query.dueSoon === "true",

// //     dueDateFrom: query.dueDateFrom || null,
// //     dueDateTo: query.dueDateTo || null,
// //     createdFrom: query.createdFrom || null,
// //     createdTo: query.createdTo || null,

// //     search: query.search || null,
// //     tags: query.tags
// //       ? Array.isArray(query.tags)
// //         ? query.tags
// //         : query.tags.split(",")
// //       : null,

// //     sortBy: query.sortBy || "createdAt",
// //     sortOrder: query.sortOrder?.toLowerCase() === "asc" ? "ASC" : "DESC",

// //     page: Math.max(parseInt(query.page) || 1, 1),
// //     limit: Math.max(Math.min(parseInt(query.limit) || 20, 100), 1),
// //   };
// // }

// // // Validate filters
// // function validateFilters(filters) {
// //   const errors = [];
// //   const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
// //   const validPriorities = ["LOW", "MEDIUM", "HIGH"];
// //   const validSortFields = [
// //     "title",
// //     "dueDate",
// //     "priority",
// //     "status",
// //     "assignedTo",
// //     "createdAt",
// //   ];

// //   if (filters.status && filters.status.length > 0) {
// //     const invalidStatuses = filters.status.filter(
// //       (s) => !validStatuses.includes(s)
// //     );
// //     if (invalidStatuses.length > 0) {
// //       errors.push(`Invalid status values: ${invalidStatuses.join(", ")}`);
// //     }
// //   }

// //   if (filters.priority && filters.priority.length > 0) {
// //     const invalidPriorities = filters.priority.filter(
// //       (p) => !validPriorities.includes(p)
// //     );
// //     if (invalidPriorities.length > 0) {
// //       errors.push(`Invalid priority values: ${invalidPriorities.join(", ")}`);
// //     }
// //   }

// //   if (filters.dueDateFrom && isNaN(Date.parse(filters.dueDateFrom))) {
// //     errors.push("Invalid dueDateFrom format");
// //   }
// //   if (filters.dueDateTo && isNaN(Date.parse(filters.dueDateTo))) {
// //     errors.push("Invalid dueDateTo format");
// //   }
// //   if (filters.createdFrom && isNaN(Date.parse(filters.createdFrom))) {
// //     errors.push("Invalid createdFrom format");
// //   }
// //   if (filters.createdTo && isNaN(Date.parse(filters.createdTo))) {
// //     errors.push("Invalid createdTo format");
// //   }

// //   if (
// //     filters.dueDateFrom &&
// //     filters.dueDateTo &&
// //     new Date(filters.dueDateFrom) > new Date(filters.dueDateTo)
// //   ) {
// //     errors.push("dueDateFrom cannot be after dueDateTo");
// //   }

// //   if (filters.page < 1) {
// //     errors.push("Page must be a positive number");
// //   }
// //   if (filters.limit < 1 || filters.limit > 100) {
// //     errors.push("Limit must be between 1 and 100");
// //   }

// //   if (!validSortFields.includes(filters.sortBy)) {
// //     errors.push(
// //       `Invalid sortBy field. Valid options: ${validSortFields.join(", ")}`
// //     );
// //   }

// //   return errors;
// // }

// // export default authenticate(handler);



// import { createTaskSchema } from "../../../lib/validation/task";
// import { validate } from "../../../lib/validation/validator";
// import {
//   createTask,
//   getFilteredTasks,
// } from "../../../lib/services/taskService";
// import { authenticate } from "../../../lib/auth";

// async function handler(req, res) {
//   // Authentication is now handled by the withAuth wrapper
//   const user = req.user;
  
//   try {
//     // Create Task
//     if (req.method === "POST") {
//       try {
//         const errors = validate(createTaskSchema, req.body);
//         if (errors) return res.status(400).json({ success: false, errors });
//         const taskData = { ...req.body, createdById: user.id };
//         const task = await createTask(taskData);
//         return res.status(201).json({ success: true, data: task });
//       } catch (error) {
//         console.error("Create task error:", error);
//         return res.status(500).json({ message: "Server error" });
//       }
//     }

//     // Return Task List
//     if (req.method === "GET") {
//       try {
//         // Parse filters from query parameters
//         const filters = parseFilters(req.query);

//         // Validate filters
//         const filterErrors = validateFilters(filters);
//         if (filterErrors.length > 0) {
//           return res.status(400).json({
//             success: false,
//             error: "Invalid filters",
//             details: filterErrors,
//           });
//         }

//         // Get filtered tasks
//         const result = await getFilteredTasks(filters);
//         return res.status(200).json(result); // Changed from 201 to 200 for GET requests
//       } catch (error) {
//         console.error(error);
//         return res
//           .status(500) // Changed from 501 to 500 for internal server errors
//           .json({ error: "Failed to fetch filtered tasks" });
//       }
//     }

//     // Handle unsupported methods
//     return res.status(405).json({ error: "Method not allowed" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal Error" }); // Changed from 501 to 500
//   }
// }

// // Parse filters from query parameters
// function parseFilters(query) {
//   return {
//     // Basic filters
//     status: query.status
//       ? Array.isArray(query.status)
//         ? query.status
//         : query.status.split(",")
//       : null,
//     priority: query.priority
//       ? Array.isArray(query.priority)
//         ? query.priority
//         : query.priority.split(",")
//       : null,
//     assignedToId: query.assignedToId
//       ? Array.isArray(query.assignedToId)
//         ? query.assignedToId
//         : query.assignedToId.split(",")
//       : null,
//     projectId: query.projectId
//       ? Array.isArray(query.projectId)
//         ? query.projectId
//         : query.projectId.split(",")
//       : null,
//     createdById: query.createdById || null,

//     unassigned: query.unassigned === "true",
//     overdue: query.overdue === "true",
//     dueSoon: query.dueSoon === "true",

//     dueDateFrom: query.dueDateFrom || null,
//     dueDateTo: query.dueDateTo || null,
//     createdFrom: query.createdFrom || null,
//     createdTo: query.createdTo || null,

//     search: query.search || null,
//     tags: query.tags
//       ? Array.isArray(query.tags)
//         ? query.tags
//         : query.tags.split(",")
//       : null,

//     sortBy: query.sortBy || "createdAt",
//     sortOrder: query.sortOrder?.toLowerCase() === "asc" ? "ASC" : "DESC",

//     page: Math.max(parseInt(query.page) || 1, 1),
//     limit: Math.max(Math.min(parseInt(query.limit) || 20, 100), 1),
//   };
// }

// // Validate filters
// function validateFilters(filters) {
//   const errors = [];
//   const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
//   const validPriorities = ["LOW", "MEDIUM", "HIGH"];
//   const validSortFields = [
//     "title",
//     "dueDate",
//     "priority",
//     "status",
//     "assignedTo",
//     "createdAt",
//   ];

//   if (filters.status && filters.status.length > 0) {
//     const invalidStatuses = filters.status.filter(
//       (s) => !validStatuses.includes(s)
//     );
//     if (invalidStatuses.length > 0) {
//       errors.push(`Invalid status values: ${invalidStatuses.join(", ")}`);
//     }
//   }

//   if (filters.priority && filters.priority.length > 0) {
//     const invalidPriorities = filters.priority.filter(
//       (p) => !validPriorities.includes(p)
//     );
//     if (invalidPriorities.length > 0) {
//       errors.push(`Invalid priority values: ${invalidPriorities.join(", ")}`);
//     }
//   }

//   if (filters.dueDateFrom && isNaN(Date.parse(filters.dueDateFrom))) {
//     errors.push("Invalid dueDateFrom format");
//   }
//   if (filters.dueDateTo && isNaN(Date.parse(filters.dueDateTo))) {
//     errors.push("Invalid dueDateTo format");
//   }
//   if (filters.createdFrom && isNaN(Date.parse(filters.createdFrom))) {
//     errors.push("Invalid createdFrom format");
//   }
//   if (filters.createdTo && isNaN(Date.parse(filters.createdTo))) {
//     errors.push("Invalid createdTo format");
//   }

//   if (
//     filters.dueDateFrom &&
//     filters.dueDateTo &&
//     new Date(filters.dueDateFrom) > new Date(filters.dueDateTo)
//   ) {
//     errors.push("dueDateFrom cannot be after dueDateTo");
//   }

//   if (filters.page < 1) {
//     errors.push("Page must be a positive number");
//   }
//   if (filters.limit < 1 || filters.limit > 100) {
//     errors.push("Limit must be between 1 and 100");
//   }

//   if (!validSortFields.includes(filters.sortBy)) {
//     errors.push(
//       `Invalid sortBy field. Valid options: ${validSortFields.join(", ")}`
//     );
//   }

//   return errors; 
// }

// // Wrapper function that handles authentication
// function withAuth(handler) {
//   return (req, res) => {
//     return authenticate(req, res, () => handler(req, res));
//   };
// }

// export default withAuth(handler);


import { authenticate } from '../../../lib/auth';
import { getFilteredTasks, createTask } from '../../../lib/services/taskService';

export default async function handler(req, res) {
  try {
    // Apply authentication middleware
    await new Promise((resolve, reject) => {
      authenticate(req, res, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    const { method } = req;

    switch (method) {
      case 'GET':
        return await handleGetTasks(req, res);
      case 'POST':
        return await handleCreateTask(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleGetTasks(req, res) {
  try {
    const { query } = req;
    const filters = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 20,
      status: query.status ? query.status.split(',') : undefined,
      priority: query.priority ? query.priority.split(',') : undefined,
      assignedToId: query.assignedToId ? query.assignedToId.split(',') : undefined,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      organizationId: req.user.organizationId,
    };

    const result = await getFilteredTasks(filters);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ message: 'Failed to fetch tasks' });
  }
}

async function handleCreateTask(req, res) {
  try {
    const { title, description, priority, assignedToId, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const taskData = {
      title,
      description: description || '',
      priority: priority || 'MEDIUM',
      assignedToId: assignedToId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdById: req.user.id,
      organizationId: req.user.organizationId,
    };

    const task = await createTask(taskData);
    return res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ message: 'Failed to create task' });
  }
}
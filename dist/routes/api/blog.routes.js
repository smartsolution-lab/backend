"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blogRoutes = (0, express_1.Router)();
const auth_1 = require("../../auth");
const blog_controller_1 = require("../../controllers/blog.controller");
// LandingPage
blogRoutes.post('/', blog_controller_1.postBlog);
blogRoutes.get('/list', blog_controller_1.fetchBlogs);
blogRoutes.get('/', blog_controller_1.fetchBlog);
blogRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, blog_controller_1.delBlog);
exports.default = blogRoutes;
//# sourceMappingURL=blog.routes.js.map
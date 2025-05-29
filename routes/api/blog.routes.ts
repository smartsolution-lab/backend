import {Router} from 'express';
const blogRoutes = Router();

import {isDemoRequest, userAuth} from '../../auth';
import {
    postBlog, fetchBlogs, fetchBlog, delBlog
} from '../../controllers/blog.controller'

// LandingPage
blogRoutes.post('/', postBlog)
blogRoutes.get('/list', fetchBlogs)
blogRoutes.get('/', fetchBlog)
blogRoutes.delete('/', userAuth({isAdmin: true}), isDemoRequest, delBlog)


export default blogRoutes;
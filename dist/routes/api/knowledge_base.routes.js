"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const knowledge_base_controller_1 = require("../../controllers/knowledge_base.controller");
const knowledge_baseRoutes = (0, express_1.Router)();
knowledge_baseRoutes.post('/', knowledge_base_controller_1.postKnowledge_base);
knowledge_baseRoutes.get('/', knowledge_base_controller_1.getKnowledge_base);
exports.default = knowledge_baseRoutes;
//# sourceMappingURL=knowledge_base.routes.js.map
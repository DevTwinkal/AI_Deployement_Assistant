"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const repoController_1 = require("../controllers/repoController");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.get('/', authController_1.getRepos);
router.post('/connect', repoController_1.connectRepo);
exports.default = router;

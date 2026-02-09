"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deployController_1 = require("../controllers/deployController");
const router = (0, express_1.Router)();
router.post('/', deployController_1.triggerDeployment);
exports.default = router;

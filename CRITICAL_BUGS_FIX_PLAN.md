# Critical Bugs Fix Plan

**Date:** January 2025  
**Status:** 🚨 CRITICAL BUGS IDENTIFIED

---

## 🚨 Issues Found

### 1. Chat Failing
**Problem:** Both Chat and AdminChat have error handling but errors not displayed
**Fix:** Add error state display in UI

### 2. ProjectDetail Dark Theme
**Problem:** ProjectDetail still uses dark theme (bg-gray-800, text-gray-400)
**Fix:** Convert all dark theme to light theme

### 3. New Project Navigation
**Problem:** Creating project from Clients redirects to `/projects/:id` (old ProjectDetail)
**Fix:** Keep navigation in Clients dashboard context

### 4. Content Ideas Location
**Problem:** Content ideas generated but no UI to view them
**Fix:** Add section to display generated content ideas in Clients dashboard

---

## ✅ Fixes to Apply

1. Fix Chat error display
2. Convert ProjectDetail to light theme
3. Fix project navigation
4. Add content ideas display

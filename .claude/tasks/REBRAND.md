# Procfiled Rebranding Checklist

## Already Changed ✅
- [x] Package name, repository URLs, and basic metadata in `package.json`

## Still Needs Changes:

### 1. README.md (Major updates needed)
- [ ] Title still says "Node Foreman"
- [ ] Installation instructions still reference `npm install -g foreman`
- [ ] Multiple references to "Node Foreman" throughout
- [ ] Image URLs still point to strongloop/node-foreman repository
- [ ] All "foreman" references in export examples and commands

### 2. CLI Interface (`nf.js`)
- [ ] The ASCII art banner still shows "Foreman"
- [ ] Help text and descriptions reference "foreman"
- [ ] Default app name for exports is still "foreman"
- [ ] Various comments and descriptions

### 3. Library Files
- [ ] Copyright headers mention "foreman" 
- [ ] Template files and export configurations
- [ ] Help text and error messages

### 4. Test Files
- [ ] Many test fixtures and configurations still use "foreman" naming
- [ ] Test server references

### 5. Template Files
- [ ] Configuration templates in `lib/` directory
- [ ] Export format templates

### 6. Other Documentation
- [ ] `CHANGES.md`, `CONTRIBUTING.md` files likely need updates
- [ ] Any remaining references in comments

## Priority Order
1. **README.md** - Complete rewrite of branding
2. **CLI help text and banner** in `nf.js` 
3. **Default export names** from "foreman" to "procfiled"
4. **Template files** and export configurations
5. **Test files** and documentation
# Pre-Commit Checklist

This document provides a checklist of items to verify before committing changes to the Research Hub Search Application.

## Code Quality

- [ ] All code follows the project's style guidelines
- [ ] No console.log statements left in production code
- [ ] No commented-out code blocks
- [ ] No hardcoded API keys or sensitive information
- [ ] All functions have appropriate error handling
- [ ] Code is properly formatted (run `npm run lint` if available)

## Testing

- [ ] Application builds without errors (`npm run build`)
- [ ] Application runs locally without errors (`npm run dev`)
- [ ] Basic search functionality works with different sources
- [ ] LLM processing works with different models
- [ ] File upload functionality works correctly
- [ ] Custom URL functionality works correctly

## Documentation

- [ ] CHANGELOG.md is updated with new changes
- [ ] README.md is updated if new features were added
- [ ] New API endpoints are documented
- [ ] New environment variables are documented
- [ ] Code comments are clear and helpful

## Environment Variables

- [ ] All required environment variables are documented in .env.example
- [ ] No .env files are included in the commit
- [ ] All new features check for required environment variables

## Dependencies

- [ ] package.json version is updated if necessary
- [ ] No unnecessary dependencies added
- [ ] Dependencies have appropriate version constraints
- [ ] No security vulnerabilities in dependencies (run `npm audit` if available)

## Cross-Browser Compatibility

- [ ] Application works in Chrome
- [ ] Application works in Firefox
- [ ] Application works in Safari
- [ ] Application works in Edge

## Accessibility

- [ ] All images have alt text
- [ ] Color contrast meets WCAG standards
- [ ] Keyboard navigation works correctly
- [ ] Screen reader compatibility is maintained

## Performance

- [ ] No unnecessary API calls
- [ ] Large data sets are paginated
- [ ] Images are optimized
- [ ] No memory leaks in components

## Security

- [ ] User inputs are properly sanitized
- [ ] API routes have appropriate authentication
- [ ] No sensitive information is exposed in client-side code
- [ ] CORS settings are appropriate

## Commit Process

1. Review this checklist
2. Update version numbers if necessary
3. Update CHANGELOG.md
4. Run the prepare-commit script:
   ```
   ./scripts/prepare-commit.sh "Your detailed commit message"
   ```
5. Push changes to the appropriate branch

## After Commit

- [ ] Verify that the application builds correctly in the CI/CD pipeline
- [ ] Verify that the application deploys correctly
- [ ] Test critical functionality in the deployed environment

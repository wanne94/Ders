# Task Completion Workflow

Prema CLAUDE.md instrukcijama:

## Standardni Workflow
1. Prvo razmisli o problemu, pročitaj codebase
2. Napiši plan u `projectplan.md` u rootu
3. Provjeri plan sa korisnikem prije počinjanja rada
4. Radi todo stavke jedna po jedna, označavajući kao završene
5. Za svaku promjenu daj objašnjenje na visokom nivou
6. Uradi sve što jednostavnije - izbegavaj masivne promjene
7. Provjeri da li komponenta već postoji prije kreiranja nove
8. Svi testni/privremeni fajlovi idu u `temp/` folder
9. Dodaj review sekciju u todo.md na kraju

## Validation Commands
- `cd web && npm run pre-deploy` - Lint + test + build
- Testovi se pokreću prije svakog deploy-a
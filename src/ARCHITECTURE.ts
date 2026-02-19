/**
 * Architecture Hexagonale - Structure complète
 * 
 * DOMAIN LAYER (Cœur métier)
 * ├── entities/        - Entités métier pures (User, Product, etc.)
 * ├── repositories/    - Interfaces des repositories
 * └── usecases/        - Logique métier (GetAllUsers, CreateUser, etc.)
 * 
 * APPLICATION LAYER (Orchestration)
 * ├── dto/             - Data Transfer Objects
 * └── services/        - Services d'application qui orchestrent les use cases
 * 
 * INFRA LAYER (Adapters)
 * ├── primary/         - Interface utilisateur (Composants, Screens, Navigation)
 * │   ├── components/  - Composants réutilisables
 * │   ├── screens/     - Écrans/Pages
 * │   └── navigation/  - Navigation et routing
 * └── secondary/       - Adaptateurs pour les systèmes externes
 *     ├── api/         - Client HTTP
 *     ├── repositories/- Implémentations des repositories
 *     └── storage/     - Stockage local (AsyncStorage, etc.)
 * 
 * SHARED LAYER (Code partagé)
 * ├── utils/           - Utilitaires
 * ├── constants/       - Constantes
 * └── hooks/           - Custom hooks réutilisables
 */

export const ARCHITECTURE_DESCRIPTION = `
Avantages de cette architecture:
✅ Testabilité - Chaque couche peut être testée indépendamment
✅ Maintenabilité - Code organisé et facile à naviguer
✅ Flexibilité - Facile de changer les implémentations (API, Storage, etc.)
✅ Réutilisabilité - Le domaine est complètement indépendant de la framework
✅ Scalabilité - Structure qui grandit bien avec le projet
`;

/**
 * Mapping des sourates du Coran avec leurs pages de début et de fin
 * Le Coran compte 604 pages au total (Mushaf Madani)
 */

export interface SouratePages {
  numero: number;
  pageDebut: number;
  pageFin: number;
}

export const SOURATE_PAGES: SouratePages[] = [
  { numero: 1, pageDebut: 1, pageFin: 1 },
  { numero: 2, pageDebut: 2, pageFin: 49 },
  { numero: 3, pageDebut: 50, pageFin: 76 },
  { numero: 4, pageDebut: 77, pageFin: 106 },
  { numero: 5, pageDebut: 106, pageFin: 127 },
  { numero: 6, pageDebut: 128, pageFin: 150 },
  { numero: 7, pageDebut: 151, pageFin: 176 },
  { numero: 8, pageDebut: 177, pageFin: 186 },
  { numero: 9, pageDebut: 187, pageFin: 207 },
  { numero: 10, pageDebut: 208, pageFin: 220 },
  { numero: 11, pageDebut: 221, pageFin: 234 },
  { numero: 12, pageDebut: 235, pageFin: 248 },
  { numero: 13, pageDebut: 249, pageFin: 254 },
  { numero: 14, pageDebut: 255, pageFin: 261 },
  { numero: 15, pageDebut: 262, pageFin: 267 },
  { numero: 16, pageDebut: 267, pageFin: 281 },
  { numero: 17, pageDebut: 282, pageFin: 292 },
  { numero: 18, pageDebut: 293, pageFin: 304 },
  { numero: 19, pageDebut: 305, pageFin: 311 },
  { numero: 20, pageDebut: 312, pageFin: 321 },
  { numero: 21, pageDebut: 322, pageFin: 331 },
  { numero: 22, pageDebut: 332, pageFin: 341 },
  { numero: 23, pageDebut: 342, pageFin: 349 },
  { numero: 24, pageDebut: 350, pageFin: 358 },
  { numero: 25, pageDebut: 359, pageFin: 366 },
  { numero: 26, pageDebut: 367, pageFin: 376 },
  { numero: 27, pageDebut: 377, pageFin: 385 },
  { numero: 28, pageDebut: 385, pageFin: 396 },
  { numero: 29, pageDebut: 396, pageFin: 404 },
  { numero: 30, pageDebut: 404, pageFin: 410 },
  { numero: 31, pageDebut: 411, pageFin: 414 },
  { numero: 32, pageDebut: 415, pageFin: 417 },
  { numero: 33, pageDebut: 418, pageFin: 427 },
  { numero: 34, pageDebut: 428, pageFin: 433 },
  { numero: 35, pageDebut: 434, pageFin: 439 },
  { numero: 36, pageDebut: 440, pageFin: 445 },
  { numero: 37, pageDebut: 446, pageFin: 452 },
  { numero: 38, pageDebut: 453, pageFin: 458 },
  { numero: 39, pageDebut: 458, pageFin: 467 },
  { numero: 40, pageDebut: 467, pageFin: 476 },
  { numero: 41, pageDebut: 477, pageFin: 482 },
  { numero: 42, pageDebut: 483, pageFin: 489 },
  { numero: 43, pageDebut: 489, pageFin: 495 },
  { numero: 44, pageDebut: 496, pageFin: 498 },
  { numero: 45, pageDebut: 499, pageFin: 502 },
  { numero: 46, pageDebut: 502, pageFin: 506 },
  { numero: 47, pageDebut: 507, pageFin: 510 },
  { numero: 48, pageDebut: 511, pageFin: 515 },
  { numero: 49, pageDebut: 515, pageFin: 517 },
  { numero: 50, pageDebut: 518, pageFin: 520 },
  { numero: 51, pageDebut: 520, pageFin: 522 },
  { numero: 52, pageDebut: 523, pageFin: 525 },
  { numero: 53, pageDebut: 526, pageFin: 528 },
  { numero: 54, pageDebut: 528, pageFin: 530 },
  { numero: 55, pageDebut: 531, pageFin: 533 },
  { numero: 56, pageDebut: 534, pageFin: 537 },
  { numero: 57, pageDebut: 537, pageFin: 541 },
  { numero: 58, pageDebut: 542, pageFin: 545 },
  { numero: 59, pageDebut: 545, pageFin: 548 },
  { numero: 60, pageDebut: 549, pageFin: 551 },
  { numero: 61, pageDebut: 551, pageFin: 552 },
  { numero: 62, pageDebut: 553, pageFin: 554 },
  { numero: 63, pageDebut: 554, pageFin: 555 },
  { numero: 64, pageDebut: 556, pageFin: 557 },
  { numero: 65, pageDebut: 558, pageFin: 559 },
  { numero: 66, pageDebut: 560, pageFin: 561 },
  { numero: 67, pageDebut: 562, pageFin: 563 },
  { numero: 68, pageDebut: 564, pageFin: 565 },
  { numero: 69, pageDebut: 566, pageFin: 567 },
  { numero: 70, pageDebut: 568, pageFin: 569 },
  { numero: 71, pageDebut: 570, pageFin: 571 },
  { numero: 72, pageDebut: 572, pageFin: 573 },
  { numero: 73, pageDebut: 574, pageFin: 575 },
  { numero: 74, pageDebut: 575, pageFin: 577 },
  { numero: 75, pageDebut: 577, pageFin: 578 },
  { numero: 76, pageDebut: 578, pageFin: 580 },
  { numero: 77, pageDebut: 580, pageFin: 581 },
  { numero: 78, pageDebut: 582, pageFin: 583 },
  { numero: 79, pageDebut: 583, pageFin: 584 },
  { numero: 80, pageDebut: 585, pageFin: 585 },
  { numero: 81, pageDebut: 586, pageFin: 586 },
  { numero: 82, pageDebut: 587, pageFin: 587 },
  { numero: 83, pageDebut: 587, pageFin: 589 },
  { numero: 84, pageDebut: 589, pageFin: 590 },
  { numero: 85, pageDebut: 590, pageFin: 591 },
  { numero: 86, pageDebut: 591, pageFin: 591 },
  { numero: 87, pageDebut: 591, pageFin: 592 },
  { numero: 88, pageDebut: 592, pageFin: 592 },
  { numero: 89, pageDebut: 593, pageFin: 594 },
  { numero: 90, pageDebut: 595, pageFin: 595 },
  { numero: 91, pageDebut: 595, pageFin: 595 },
  { numero: 92, pageDebut: 595, pageFin: 596 },
  { numero: 93, pageDebut: 596, pageFin: 596 },
  { numero: 94, pageDebut: 596, pageFin: 596 },
  { numero: 95, pageDebut: 597, pageFin: 597 },
  { numero: 96, pageDebut: 597, pageFin: 598 },
  { numero: 97, pageDebut: 598, pageFin: 598 },
  { numero: 98, pageDebut: 598, pageFin: 599 },
  { numero: 99, pageDebut: 599, pageFin: 599 },
  { numero: 100, pageDebut: 599, pageFin: 600 },
  { numero: 101, pageDebut: 600, pageFin: 600 },
  { numero: 102, pageDebut: 600, pageFin: 600 },
  { numero: 103, pageDebut: 601, pageFin: 601 },
  { numero: 104, pageDebut: 601, pageFin: 601 },
  { numero: 105, pageDebut: 601, pageFin: 601 },
  { numero: 106, pageDebut: 602, pageFin: 602 },
  { numero: 107, pageDebut: 602, pageFin: 602 },
  { numero: 108, pageDebut: 602, pageFin: 602 },
  { numero: 109, pageDebut: 603, pageFin: 603 },
  { numero: 110, pageDebut: 603, pageFin: 603 },
  { numero: 111, pageDebut: 603, pageFin: 603 },
  { numero: 112, pageDebut: 604, pageFin: 604 },
  { numero: 113, pageDebut: 604, pageFin: 604 },
  { numero: 114, pageDebut: 604, pageFin: 604 },
];

export const TOTAL_PAGES = 604;

/**
 * Obtient les informations de page pour une sourate donnée
 */
export function getSouratePages(sourateNumero: number): SouratePages | undefined {
  return SOURATE_PAGES.find(s => s.numero === sourateNumero);
}

/**
 * Calcule le pourcentage d'avancement basé sur les pages du Coran
 * @param currentSourate Numéro de la sourate actuelle
 * @param currentVerset Numéro du verset actuel dans la sourate
 * @param totalVersets Nombre total de versets dans la sourate
 * @returns Pourcentage d'avancement (0-100)
 */
export function calculateProgressByPages(
  currentSourate: number,
  currentVerset: number = 1,
  totalVersets: number = 1
): number {
  const sourateInfo = getSouratePages(currentSourate);
  if (!sourateInfo) return 0;

  const { pageDebut, pageFin } = sourateInfo;
  const souratePages = pageFin - pageDebut + 1;
  
  // Estimer la position dans la sourate basée sur les versets
  const versetProgress = totalVersets > 0 ? currentVerset / totalVersets : 0;
  const estimatedPage = pageDebut + (souratePages * versetProgress);
  
  // Calculer le pourcentage par rapport aux 604 pages
  return Math.min((estimatedPage / TOTAL_PAGES) * 100, 100);
}

/**
 * Calcule le nombre total de pages lues jusqu'à une sourate donnée (incluse)
 */
export function getTotalPagesRead(upToSourate: number): number {
  const sourateInfo = getSouratePages(upToSourate);
  return sourateInfo ? sourateInfo.pageFin : 0;
}

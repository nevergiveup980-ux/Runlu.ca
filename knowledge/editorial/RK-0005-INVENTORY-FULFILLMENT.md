# RK-0005 — Why sufficient inventory may still fail an order

Status: editorial draft; not approved for publication.
Sector: carpet warehouse operations.
Example is hypothetical, not a real customer case.

## English

A warehouse may record 300 square feet of carpet while an order needs only 240 square feet, yet still be unable to fulfill it. Imagine two remnants, each 12 feet wide and 12.5 feet long: together they contain 300 square feet. If the job requires one continuous 12-by-20-foot piece, neither remnant is long enough. Joining pieces may introduce seams that the approved layout or customer requirements do not permit.

Other constraints include stock already reserved for another order, damage, inaccurate locations, usable roll width, dye lot, pile direction, pattern matching and manufacturer instructions. Recorded area, available area and material that can actually fulfill an order are different quantities.

Before confirming: verify the required dimensions and orientation, identify actual roll IDs, check continuous usable length, reservation status, physical condition, dye lot and pattern requirements. When uncertain, flag the order for review instead of promising availability.

## 中文

库房系统显示某款地毯有 300 平方英尺库存，而订单只需要一整块 12 英尺宽、20 英尺长的地毯，面积为 240 平方英尺。假设库房实际有两块余料，每块宽 12 英尺、长 12.5 英尺，总面积虽然达到 300 平方英尺，却没有一块足够长。若拼接会产生接缝，还必须考虑既定方案和客户是否允许。

此外，库存可能已被其他订单预留，存在损坏、库位记录错误或实际可用宽度不足等问题。即使产品型号相同，染色批次、绒毛方向、花纹对齐和厂家要求也可能限制混用。

确认订单前，应逐一核对裁切尺寸、卷号、连续可用长度、预留状态、材料状况及 Dyelot 等条件。不确定时标记待审核，而不是直接承诺有货。

**专业判断的关键，不只是库存总面积，而是具体材料能否满足这张订单的全部条件。**

## Français

Un inventaire peut indiquer 300 pieds carrés de moquette sans permettre de satisfaire une commande de 240 pieds carrés. Deux chutes de 12 pieds sur 12,5 pieds représentent ensemble 300 pieds carrés. Pourtant, aucune ne permet de découper une seule pièce de 12 pieds sur 20 pieds. Les joints éventuels doivent respecter le plan approuvé et les exigences du client.

Les réservations, les dommages, les erreurs d'emplacement, la largeur utile, les lots de teinture, le sens du velours, les raccords de motifs et les instructions du fabricant peuvent aussi limiter l'utilisation. Avant de confirmer une commande, vérifier les dimensions, les identifiants des rouleaux, la longueur continue, les réservations et les caractéristiques du produit. En cas d'incertitude, demander une vérification.

## Español

El inventario puede indicar 300 pies cuadrados de alfombra y aun así no permitir completar un pedido de 240 pies cuadrados. Dos sobrantes de 12 por 12,5 pies suman 300 pies cuadrados, pero ninguno permite cortar una sola pieza de 12 por 20 pies. Cualquier unión debe cumplir el diseño aprobado y los requisitos del cliente.

Las reservas, los daños, los errores de ubicación, el ancho útil, el lote de teñido, la dirección del pelo, la coincidencia de patrones y las instrucciones del fabricante también pueden limitar el uso. Antes de confirmar un pedido, hay que verificar dimensiones, rollos específicos, longitud continua, reservas y características del material. Si hay dudas, se requiere una revisión.

## Editorial gate

- The dimensional example is hypothetical; arithmetic: 2 × 12 × 12.5 = 300; 12 × 20 = 240.
- No external standards, illustrations or protected prose reproduced.
- Do not infer universal seam or dye-lot installation rules; product and project constraints vary.
- Pending independent factual review, four-language professional review, and documented editorial approval.
- Do not insert this draft into published.json until checks are completed.

## Operational decision framework — working editorial supplement

### English: six checkpoints before promising material

1. **Order geometry:** Confirm the actual required piece dimensions, number of pieces, orientation and approved seam layout. An area total alone cannot validate a cut.
2. **Physical stock:** Verify the specific roll/remnant identifiers and measured usable width and continuous length. Do not infer a continuous piece from aggregated inventory.
3. **Availability:** Subtract reservations and holds, and check for damaged or missing material. A recorded quantity may be neither available nor usable.
4. **Compatibility:** Confirm product identity, dye-lot restrictions, shade, pile direction, pattern repeat and manufacturer/project instructions as applicable. Same SKU does not guarantee interchangeability.
5. **Feasible allocation:** Match each required piece to a specific verified roll or remnant. Record whether a seam, rotation or substitute would require customer/project approval.
6. **Release decision:** Mark the order **ready** only after all constraints are satisfied; otherwise use **review needed** or **not fulfillable from current stock**, with the reason and next action.

**Failure-mode example:** A salesperson sees a combined 300 ft² and promises a continuous 12 × 20 ft cut. The picker discovers two separate 12 × 12.5 ft remnants. The root cause is a *geometry-versus-area mismatch*, not a shortage of aggregate square footage. A useful prevention is to require roll-level continuous dimensions at order confirmation.

### 中文：承诺有货前的六项核对

1. **订单尺寸：** 核实每块材料的实际宽长、块数、方向和已批准的接缝方案，不能只看总面积。
2. **实物库存：** 对应具体卷号或余料编号，核对有效宽度和连续长度，不把几块余料的面积当成一整块材料。
3. **可分配状态：** 扣除已预留、暂停使用、损坏或实物缺失的部分。
4. **材料兼容性：** 按项目要求检查型号、染色批次、色差、绒毛方向、花纹循环及厂家说明。同 SKU 不一定能随意拼用。
5. **实际分配：** 为每块所需材料找到可核实的卷材来源。若涉及接缝、改变方向或替代材料，明确是否需要审批。
6. **出库决定：** 条件全部满足才标记“可以履约”；否则标记“待复核”或“现有库存无法履约”，并记录原因和下一步。

**典型失误：** 销售人员看到合计 300 平方英尺就承诺可裁一整块 12 × 20 英尺，库房实际只有两块 12 × 12.5 英尺的余料。问题不是总面积不足，而是**连续尺寸不满足订单**。预防办法是承诺订单前必须核对卷级尺寸。

### Français : six vérifications avant de confirmer

1. **Dimensions :** vérifier les dimensions de chaque pièce, l'orientation et le plan de joints approuvé, et non seulement la surface totale.
2. **Stock physique :** identifier les rouleaux ou chutes et confirmer leur largeur utile et leur longueur continue.
3. **Disponibilité :** tenir compte des réservations, blocages, dommages et écarts d'inventaire.
4. **Compatibilité :** examiner le produit, le lot de teinture, les nuances, le sens du velours, les motifs et les instructions applicables.
5. **Affectation :** associer chaque coupe à une pièce de stock vérifiée; obtenir les approbations requises pour tout joint ou remplacement.
6. **Décision :** confirmer uniquement lorsque les contraintes sont satisfaites; sinon consigner « vérification requise » ou « stock insuffisant pour cette configuration ».

**Erreur typique :** annoncer une coupe continue de 12 × 20 pieds à partir de deux chutes de 12 × 12,5 pieds. La surface cumulée suffit, mais aucune pièce n'a la longueur nécessaire.

### Español: seis comprobaciones antes de confirmar

1. **Dimensiones:** verificar cada pieza requerida, orientación y disposición aprobada de juntas; no depender solo del área total.
2. **Existencias físicas:** identificar rollos y sobrantes concretos y comprobar ancho útil y longitud continua.
3. **Disponibilidad:** considerar reservas, bloqueos, daños y discrepancias de inventario.
4. **Compatibilidad:** revisar producto, lote de teñido, tono, dirección del pelo, patrón e instrucciones aplicables.
5. **Asignación:** relacionar cada corte con un rollo o sobrante verificado; solicitar aprobación para juntas o sustituciones cuando corresponda.
6. **Decisión:** confirmar solo si se cumplen todas las condiciones; de lo contrario registrar « requiere revisión » o « no realizable con el inventario actual ».

**Error típico:** prometer una pieza continua de 12 × 20 pies basándose en dos sobrantes de 12 × 12,5 pies. La superficie sumada es suficiente, pero ninguna pieza tiene la longitud requerida.

### Verification boundary

This supplement is a general operational framework, not an assertion that a particular customer contract, manufacturer or installation standard mandates these six steps. Confirm terminology and project-specific constraints before publication. No claim of field observation or independent reviewer sign-off is made.

## Pre-publication technical review — 2026-11-02

**Review scope:** Internal editorial consistency and arithmetic only. This is **not** an independent trade expert sign-off or external source verification.

### Checks completed

- Example arithmetic independently recalculated: each 12 ft × 12.5 ft remnant = 150 ft²; two remnants = 300 ft²; required single piece 12 ft × 20 ft = 240 ft². Neither 12.5-ft remnant can yield a 20-ft continuous length without joining pieces.
- Confirmed the article explicitly conditions any joining, substitution, rotation or seam layout on the approved project plan and applicable manufacturer/customer requirements; it does not claim all seams are forbidden.
- Confirmed English, Chinese, French and Spanish sections all distinguish aggregated stock area from a single continuous piece, and all six-point frameworks cover dimensions, actual stock, allocation, compatibility, assignment and decision.
- Copyright handling: the present article contains original explanatory wording and a hypothetical arithmetic example. No third-party text, image, table or diagram is included. This observation is not a license determination for materials added later.

### Remaining publication blockers

1. **Professional technical review:** An identified flooring operations reviewer must validate terminology, exceptions and real-world applicability; record name, date and findings.
2. **Language review:** An identified reviewer must confirm all four translations, especially the distinction between a seam and a roll remnant, and locale-appropriate terminology.
3. **Source evidence:** If published as a technical reference, add verifiable primary manufacturer or relevant industry sources for any specific technical claims. The current article should not imply universal installation standards.
4. **Publication workflow:** Create a reviewed structured record with its evidence reference only after the above checks. Keep `knowledge/data/published.json` unchanged until approved.

**Decision:** HOLD — valuable editorial draft, but not independently verified or approved for public release.

## Practical decision matrix — editorial enhancement (2026-11-02)

This is a **warehouse triage aid**, not an installation standard. All cases assume the order specifications have been confirmed.

| Observed condition | What it means | Next action | Suggested disposition |
| --- | --- | --- | --- |
| Total area sufficient; no piece meets continuous cut dimensions | Geometry mismatch | Check approved seam plan or source another continuous piece | Review needed |
| Required roll dimensions available, but stock reserved | Allocation conflict | Check reservation ownership and authorization before reallocating | Review needed |
| Roll listed in system but cannot be located | Inventory integrity issue | Physically locate and reconcile the roll before confirmation | Hold |
| Roll located but damaged or short of usable length | Usable-stock shortfall | Measure unaffected section and reassess cut plan | Review needed |
| Two rolls match SKU but have different dye lots | Potential appearance/compatibility constraint | Verify project/manufacturer requirements and approvals | Review needed |
| Specific pieces verified, compatible, unreserved and meet approved layout | Constraints appear satisfied | Record roll IDs, measurements and release approval | Ready for release |

### 中文：现场判定速查

| 发现的问题 | 判断 | 下一步 |
| --- | --- | --- |
| 总面积够，但没有足够长的整块材料 | 尺寸组合不满足订单 | 核对已批准的接缝方案，或另找整卷 |
| 尺寸够，但材料已被预留 | 可分配库存不足 | 核实预留归属，不擅自挪用 |
| 系统有货，现场找不到 | 账实不符 | 先定位实物并更正记录 |
| 找到卷材，但损坏或有效长度不足 | 可用库存不足 | 重新实测，评估其他卷材 |
| 型号相同，染色批次不同 | 可能存在色差或兼容性限制 | 按项目及厂家要求核实 |
| 卷号、尺寸、状态及方案全部核实 | 具备出库条件 | 记录依据后确认 |

### Français : décisions de triage

| Constat | Décision recommandée |
| --- | --- |
| Surface suffisante, longueur continue insuffisante | Vérifier le plan de joints approuvé ou chercher une autre pièce |
| Dimensions suffisantes, rouleau réservé | Vérifier les droits de réaffectation avant toute promesse |
| Stock informatique introuvable physiquement | Suspendre la confirmation et rapprocher l'inventaire |
| Rouleau endommagé ou longueur utile insuffisante | Mesurer la partie utilisable et réévaluer |
| Même référence, lots de teinture différents | Vérifier les contraintes du projet et du fabricant |
| Toutes les pièces et contraintes vérifiées | Consigner les références et autoriser la préparation |

### Español: decisiones operativas

| Hallazgo | Acción recomendada |
| --- | --- |
| Área suficiente, longitud continua insuficiente | Revisar el plan aprobado de juntas o buscar otra pieza |
| Dimensiones suficientes, material reservado | Verificar autorización antes de reasignar |
| Existencias en el sistema, pero no localizadas | Detener la confirmación y conciliar inventario |
| Rollo dañado o longitud útil insuficiente | Medir la sección aprovechable y reevaluar |
| Misma referencia, distintos lotes de teñido | Verificar requisitos del proyecto y del fabricante |
| Todas las piezas y condiciones verificadas | Registrar identificadores y aprobar preparación |

### Explicit non-claims

- These are **suggested operational dispositions**, not a guarantee of contract fulfillment.
- The example does not account for cutting tolerances, trimming, pattern repeat allowances or waste; actual jobs require those inputs.
- Dye-lot differences are a flag for review, not proof that material is unusable.
- A warehouse employee must not override customer approvals, reservations or installation specifications merely because the material appears physically sufficient.

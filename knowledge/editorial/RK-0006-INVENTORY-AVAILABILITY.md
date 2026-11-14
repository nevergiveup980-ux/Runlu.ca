# RK-0006 | Editorial manuscript v0.1 — four languages

**RESEARCH DRAFT — HOLD — NOT PUBLISHED.** Editorial scenarios below are hypothetical, not actual customer transactions. All terminology and translations require independent review. Technical evidence and licensing notes: [RK-0006 research brief](../reviews/RK-0006-RESEARCH-BRIEF.md).

---

## EN — Why on-hand stock cannot always be promised to a new order

A sales screen shows carpet in stock. A customer needs it today. Why might the warehouse still say, “We cannot promise that material yet”?

The key is that **physical presence is not the same as permission or ability to allocate**. Some material may already be committed to earlier orders. Some may be reserved, quarantined, damaged or otherwise restricted by a particular inventory system. A future expected delivery may support a dated promise but does not mean the goods are physically present today.

### Three questions, not one number

**On hand:** What quantity does the inventory system record as physically present? **Available:** What portion can be allocated now, after applying that system’s reservation and status rules? **Available to promise (ATP):** What can reasonably be promised for a particular date when relevant demand and expected receipts are considered? ERP products use different fields and calculations; do not assume these terms are interchangeable.

### Example A: stock already committed

Imagine 100 linear feet of a carpet product on hand. Earlier orders have commitments for 65 linear feet. Under the simple rule “available = on hand − committed,” only 35 linear feet remain. A new order asking for 50 linear feet cannot be confirmed from that quantity alone. The figures are illustrative, not a statement about a real order.

### Example B: restricted stock

Imagine 80 linear feet physically present. Under the hypothetical system rules, 30 linear feet are blocked from commitment by a material-status hold. Another 20 linear feet of eligible stock are already committed. That leaves 30 linear feet for consideration, **assuming these categories do not overlap**. The warehouse must not release a hold simply to satisfy a sale; the responsible authority must review it.

### A second check: can the available material actually be used?

Even when a system shows enough available footage, a project may require a continuous cut, a matching dye lot, an acceptable roll condition and a compatible installation plan. RK-0005 covers the separate question of cut geometry. This article addresses **allocation and promise**, not permission to cut or install.

### Before confirming a new order

Confirm the product and units; inspect reservations and restrictions; identify the actual roll or remnant and dye lot; verify continuous usable dimensions; distinguish expected arrival from goods already received; and record the decision with the responsible sales/inventory authority. If the data conflict, pause the promise and resolve the discrepancy rather than overriding existing commitments.

**Editorial caution:** This is a practical decision framework, not a universal ERP formula or installation standard. Manufacturer instructions, contract terms and company procedures take precedence.

---

## 中文 — 为什么账面有库存，却不能承诺给新订单？

销售系统显示仓库里还有地毯，客户也正等着下单。可库房核对后，却说：“这批材料现在还不能承诺给新订单。”问题出在哪里？

关键在于：**材料放在仓库里，不等于可以立即分配。** 一部分库存可能已经留给先前的订单；另一部分可能处于预留、质量待检、损坏或其他限制状态。预计未来到货的材料，也不能当作今天已经入库的现货。

### 先分清三个概念

**账面现存数量（On-hand）**：系统记录的现有实物数量。**当前可用数量（Available）**：按照本系统的预留、承诺和库存状态规则，现在可以分配的部分。**可承诺数量（ATP）**：考虑指定日期的需求和预计入库后，可能对客户作出的交付承诺。不同软件的字段和计算方法不完全相同，不能只凭名称相似就混为一谈。

### 情景一：材料已被其他订单占用

假设仓库有某款地毯 100 线性英尺（LF），其中 65 LF 已经承诺给之前的订单。如果系统采用“可用量＝现存量－已承诺量”的简单规则，那么只剩 35 LF。此时新订单要求 50 LF，就不能仅凭“仓库有 100 LF”直接答应客户。这些数字仅用于说明，不对应真实客户订单。

### 情景二：部分材料受到限制

再假设仓库实物共有 80 LF，其中 30 LF 按假设的库存状态规则暂时禁止分配；另外 20 LF 合格库存已承诺给其他订单。在这些数量互不重叠的前提下，可供进一步核对的数量为 30 LF。为了完成销售而擅自解除库存限制，是不合适的；必须由有权限的人员核实并批准。

### 数量可用，还要检查能不能真正使用

即使系统显示数量足够，也不代表一定能裁出项目要求的连续整块地毯。卷材长度、实际可用幅宽、色批（Dyelot）、材料状态、接缝方案和施工要求都可能改变结论。RK-0005 重点讨论连续裁切问题；本文讨论的是**库存分配和交付承诺**，二者应分别核对。

### 销售与库房如何确认？

先核对产品型号和计量单位，再核查已预留、已承诺和受限制的数量；确认实际卷号、余料及色批；检查可用尺寸；将预计到货与已入库材料区分开；最后由负责的销售或库存管理人员确认并留下记录。遇到数字不一致时，应暂停承诺、查清原因，而不是直接覆盖既有预留。

**编辑提示：** 本文是实际工作中的判断框架，不是所有库存软件通用的计算公式，也不是裁切或安装许可。具体操作应以企业授权流程、产品要求和合同条件为准。

---

## FR — Pourquoi le stock en main n’est pas toujours disponible à la commande

Le système indique qu’un rouleau de moquette est en stock. Pourtant, l’entrepôt ne peut pas nécessairement le promettre à un nouveau client. **La présence physique ne signifie pas que la marchandise est libre d’affectation.** Une partie peut être réservée, engagée pour une commande antérieure ou soumise à une restriction de qualité ou de statut.

### Trois notions à distinguer

**Stock physique (on-hand) :** quantité enregistrée comme présente. **Stock disponible :** quantité qui peut être affectée immédiatement selon les règles de réservation et de statut du système. **Disponible à promettre (ATP) :** quantité pouvant être promise pour une date donnée, en tenant compte, selon la configuration, des besoins et réceptions attendues. Les définitions opérationnelles varient d’un logiciel à l’autre. Une réception prévue ne constitue pas du stock physiquement reçu aujourd’hui.

### Exemple A — stock déjà engagé

Supposons 100 pieds linéaires de moquette en stock, dont 65 déjà engagés pour des commandes précédentes. Avec la règle simplifiée « disponible = stock physique − quantité engagée », il reste 35 pieds linéaires. Une nouvelle demande de 50 pieds linéaires ne peut donc pas être confirmée sur cette seule base. Cet exemple est fictif.

### Exemple B — stock bloqué

Supposons 80 pieds linéaires physiquement présents. Dans cet exemple fictif, 30 sont exclus de l’affectation par un statut de blocage, et 20 autres pieds linéaires admissibles sont déjà engagés. Si ces groupes ne se chevauchent pas, 30 pieds linéaires restent à examiner. Un blocage ne doit pas être levé sans autorisation.

### Quantité disponible ne signifie pas découpe réalisable

Il faut également vérifier le segment continu utilisable, le lot de teinture, l’état du rouleau et les exigences du projet. RK-0005 traite séparément des dimensions de découpe. Le présent article concerne l’affectation du stock et les promesses de livraison, non une autorisation de coupe.

### Vérification avant de confirmer

Contrôler la référence et l’unité de mesure, les réservations, les restrictions, le rouleau et son lot, les dimensions utilisables, ainsi que la différence entre réception attendue et réception effective. Faire valider la décision par la personne responsable et conserver une trace. En cas d’écart, suspendre la promesse jusqu’à clarification.

**Note éditoriale :** cadre de décision pratique, non formule universelle de gestion des stocks ni norme de pose. Traduction et terminologie à réviser.

---

## ES — Por qué las existencias físicas no siempre están disponibles para un nuevo pedido

El sistema muestra alfombra en el almacén, pero eso no significa que pueda prometerse de inmediato a otro cliente. **La presencia física no equivale a disponibilidad para asignación.** Una parte puede estar reservada, comprometida con pedidos anteriores o bloqueada por su estado o calidad.

### Tres conceptos diferentes

**Existencias físicas (on-hand):** cantidad registrada como presente. **Cantidad disponible:** parte que puede asignarse ahora según las reglas de reservas y estados del sistema. **Disponible para prometer (ATP):** cantidad que podría prometerse para una fecha determinada teniendo en cuenta, según la configuración, la demanda y las entradas previstas. Los sistemas no utilizan necesariamente las mismas fórmulas. Una recepción prevista no equivale a existencias físicamente recibidas hoy.

### Ejemplo A: material comprometido

Supongamos 100 pies lineales de alfombra en existencias y 65 pies lineales ya comprometidos con pedidos anteriores. Con la regla simplificada «disponible = existencias − comprometido», quedan 35 pies lineales. No sería correcto confirmar un nuevo pedido de 50 pies lineales solo porque el total físico sea 100. Es un ejemplo hipotético.

### Ejemplo B: material restringido

Supongamos 80 pies lineales físicamente presentes. En este ejemplo, 30 pies lineales están bloqueados para asignación por su estado y otros 20 pies lineales aptos ya están comprometidos. Si las categorías no se superponen, quedan 30 pies lineales por evaluar. No debe levantarse una restricción sin la autorización correspondiente.

### Disponible no siempre significa utilizable

También hay que comprobar la longitud continua aprovechable, el lote de teñido (Dyelot), el estado del material y las condiciones de instalación. RK-0005 trata por separado la geometría de corte. Aquí hablamos de **asignación de inventario y compromisos de entrega**, no de autorización para cortar.

### Antes de prometer un pedido

Verificar el producto y la unidad, revisar reservas y restricciones, identificar el rollo y el lote, comprobar las dimensiones útiles, distinguir una recepción prevista de una ya realizada y registrar la decisión con el responsable de ventas o inventario. Si hay discrepancias, detener la promesa hasta aclararlas.

**Nota editorial:** marco práctico, no fórmula universal de ERP ni norma de instalación. Pendiente de revisión técnica y lingüística.

---

## Editorial review checklist
- [ ] Confirm Oracle and Microsoft citations and precise product/version scope.
- [ ] Confirm examples do not double-count blocked and committed quantities.
- [ ] Review Canadian flooring/warehouse terminology (LF, dye lot, roll, remnant).
- [ ] Independently proofread all four language versions, including titles.
- [ ] Verify licensing and link persistence.
- [ ] Obtain explicit editorial approval before adding to published dataset.

**Publication status remains HOLD.**

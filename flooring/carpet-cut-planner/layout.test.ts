import {it,expect} from 'vitest';
import {renderCutLayout} from './layout';
it('uses safe numbered geometry and a full coordinate legend even for tiny cuts',()=>{
 const html=renderCutLayout({id:'<roll>',w:12,l:30},[{id:'Long <piece>',x:0,y:0,w:6,h:10,rotated:true},{id:'tiny',x:6,y:0,w:.1,h:.1}],10);
 expect(html).toContain('Width 12.00 ft');expect(html).toContain('6.00 × 10.00');expect(html).toContain('Rotated 90°');
 expect(html).toContain('Long &lt;piece&gt;');expect(html).not.toContain('<piece>');expect(html).toContain('<td>tiny</td>');expect(html).toContain('X →');
});

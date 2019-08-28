import { Container } from '../src/drawing/core/containers/container'
import { refreshDiagramElements } from '../src/drawing/rendering/canvas-renderer';
import { DrawingRenderer } from '../src/drawing/rendering/renderer';
import { Size } from '../src/drawing/primitives/size';
import { PathElement } from '../src/drawing/core/elements/path-element';
import { TextElement } from '../src/drawing/core/elements/text-element';
import { createMeasureElements } from '../src/drawing/utility/dom-util';
import { Canvas } from '../src/drawing/core/containers/canvas';
import { DrawingElement } from '../src/drawing/core/elements/drawing-element';


let renderer = new DrawingRenderer('diagram', false);

let ele = document.getElementById('canvase1');
createMeasureElements();
let canvas= new Canvas();
canvas.id = 'canvase1';
 let basicElement = new DrawingElement();
 let content = basicElement;
 content.cornerRadius = 15;
 content.style.fill = '#FFDCE3EF';
 content.style.strokeColor = "#FF192760";
var textele = new TextElement();
 textele.style.fontFamily="Times New Roman";
 textele.style.fontSize= 20;
 textele.margin={right:10, left:10, top:70,bottom:10}
 textele.content = "1234567890000123456789001234567890";
 
 var pathContent1 = new PathElement();
 pathContent1.id =  '_stamp';
 pathContent1.data =  "M87.352954,15.960012 L81.730947,24.153986 88.750902,24.153986 z M64.153024,11.059988 C63.626024,11.059988 63.246024,11.160988 63.013025,11.363989 62.781025,11.566989 62.579025,11.963989 62.407026,12.554991 L60.112025,20.260999 C61.462026,20.238999 62.468025,20.162 63.131025,20.031 64.310024,19.811999 65.214024,19.384998 65.845023,18.748998 66.277023,18.310997 66.683023,17.694996 67.060022,16.900995 67.437023,16.106994 67.626023,15.249993 67.626024,14.328992 67.626023,13.387991 67.362023,12.60699 66.835022,11.98799 66.309023,11.368989 65.414023,11.059988 64.153024,11.059988 z M37.188995,11.027031 C36.371998,11.02703 35.817997,11.14503 35.525997,11.380029 35.234997,11.61503 35.027996,11.93003 34.903996,12.324031 L29.67099,29.316025 C29.620991,29.480022 29.58699,29.628023 29.567989,29.759022 29.549992,29.891022 29.540989,30.005022 29.540989,30.104023 29.540989,30.541021 29.692989,30.859022 29.995991,31.056023 30.298992,31.253021 30.845993,31.352022 31.638992,31.352024 36.156998,31.352022 39.424999,29.293022 41.443001,25.178024 42.669003,22.683025 43.281002,20.046026 43.281,17.265028 43.281002,15.602028 42.965002,14.278029 42.334003,13.29303 41.343,11.78203 39.627998,11.02703 37.188995,11.027031 z M26.397987,9.9750308 L37.427998,9.9750308 C41.161001,9.9750309 44.000004,10.822031 45.946007,12.51403 47.893007,14.206029 48.866007,16.477028 48.866007,19.324027 48.866007,22.753025 47.426006,25.733025 44.545002,28.263021 41.343,31.077023 37.138996,32.485022 31.93399,32.485023 L21.028984,32.485023 21.028984,31.615021 C21.857983,31.516022 22.444984,31.363022 22.791985,31.155022 23.372986,30.816021 23.811985,30.164022 24.108986,29.200022 L28.772991,14.114029 C28.908989,13.687029 29.01099,13.328029 29.078991,13.038029 29.146992,12.74803 29.180988,12.49303 29.180988,12.275029 29.180988,11.70503 29.001991,11.34703 28.64299,11.19903 28.283989,11.05203 27.535988,10.93403 26.397987,10.84603 z M129.078,9.9750028 L149.97002,9.9750028 148.59702,16.433011 147.61402,16.350011 C147.55202,14.160009 146.85703,12.664007 145.53002,11.865006 144.81002,11.427005 143.74302,11.186005 142.32902,11.142004 L137.04601,28.357027 136.73001,29.519028 C136.69301,29.672028 136.66801,29.798029 136.65601,29.89603 136.64301,29.994028 136.63701,30.093029 136.63701,30.190029 136.63701,30.76803 136.84101,31.13203 137.25002,31.27903 137.65801,31.426031 138.51102,31.538031 139.81001,31.614031 L139.81001,32.484032 127.232,32.484032 127.232,31.614031 C128.395,31.614031 129.193,31.517031 129.626,31.32003 130.318,31.00403 130.83801,30.302029 131.18401,29.213028 L136.77101,11.142004 C134.88801,11.131005 133.27701,11.534006 131.93601,12.350006 130.59401,13.165008 129.481,14.368009 128.59501,15.956012 L127.612,15.72601 z M53.94603,9.9749874 L64.393024,9.9749874 C66.727023,9.9749867 68.537022,10.177987 69.821022,10.582987 72.180021,11.327988 73.35902,12.75299 73.359021,14.855993 73.35902,15.556993 73.16102,16.303995 72.765021,17.098995 72.36902,17.892997 71.707021,18.612997 70.779021,19.258997 70.123021,19.718999 69.355022,20.091999 68.477022,20.377001 67.957023,20.540999 67.147023,20.738 66.045023,20.967999 66.170023,21.315001 66.253023,21.531001 66.295022,21.617002 L69.222023,29.21501 C69.617022,30.228012 70.041022,30.872013 70.493022,31.150013 70.944021,31.427013 71.634021,31.582014 72.56102,31.614014 L72.56102,32.484015 64.917023,32.484015 60.816027,21.361 59.751026,21.361 57.502028,28.36101 57.186028,29.522009 C57.162027,29.609011 57.143027,29.704012 57.131027,29.808014 57.118028,29.911011 57.112027,30.018011 57.112026,30.126011 57.112027,30.726013 57.276028,31.103012 57.604026,31.255013 57.932027,31.407013 58.689027,31.527014 59.877027,31.614014 L59.877027,32.484015 48.560032,32.484015 48.560032,31.614014 C49.46303,31.517014 50.131031,31.320013 50.56403,31.02701 50.99703,30.733013 51.35603,30.129011 51.641029,29.21501 L56.307028,14.119992 C56.403028,13.810991 56.481028,13.540991 56.543028,13.310991 56.655027,12.83999 56.710028,12.47299 56.710028,12.209988 56.710028,11.672989 56.537027,11.333988 56.191029,11.190989 55.845028,11.048988 55.096027,10.933988 53.94603,10.845989 z M104.97798,9.9749824 L125.18198,9.9749824 123.56798,16.36699 122.54698,16.218988 C122.52298,14.607987 122.23098,13.463986 121.67298,12.783986 120.70598,11.612984 118.77598,11.026983 115.88598,11.026983 115.02998,11.026983 114.44398,11.124983 114.12698,11.321984 113.81098,11.518983 113.55998,11.928984 113.37398,12.553984 L111.12498,20.013994 C113.65898,19.947994 115.30798,19.750994 116.07498,19.422993 116.83998,19.093993 117.69298,18.107991 118.63198,16.464989 L119.68998,16.57999 116.86998,25.781 115.83098,25.617001 C115.87998,25.288 115.91498,25.004 115.93298,24.763 115.95198,24.521 115.95998,24.334999 115.95998,24.204 115.95998,23.096998 115.63198,22.303997 114.97498,21.821997 114.31798,21.339995 112.90998,21.097996 110.75098,21.097996 L108.24998,29.315006 C108.21298,29.458006 108.18198,29.589006 108.15798,29.710005 108.13298,29.830006 108.12098,29.950006 108.12098,30.071007 108.12098,30.727007 108.43598,31.171007 109.06698,31.400007 109.44998,31.543009 110.04298,31.614008 110.84798,31.614008 L110.84798,32.484009 99.60898,32.484009 99.60898,31.614008 C100.52398,31.515009 101.19798,31.313007 101.63098,31.007008 102.06398,30.700006 102.41598,30.097006 102.68898,29.201006 L107.35298,14.112988 C107.43898,13.805986 107.51298,13.537986 107.57498,13.307987 107.68598,12.837985 107.74198,12.470985 107.74198,12.208984 107.74198,11.671984 107.56898,11.332983 107.22198,11.189982 106.87598,11.047983 106.12798,10.932983 104.97798,10.845984 z M90.335926,9.5150047 L91.318897,9.5150047 94.955919,28.754999 C95.202929,30.04797 95.499926,30.838985 95.84691,31.128963 96.192919,31.419979 96.953905,31.602962 98.128956,31.67901 L98.128956,32.484003 86.606922,32.484003 86.606922,31.67901 C87.694935,31.602962 88.464954,31.447018 88.916919,31.211969 89.367908,30.976009 89.593922,30.486019 89.59392,29.740963 89.593922,29.48901 89.524952,28.885981 89.389942,27.932978 89.364918,27.736017 89.241932,26.921015 89.0219,25.484978 L80.825918,25.484978 78.609913,28.903009 C78.460927,29.132992 78.327932,29.383968 78.210927,29.658993 78.092947,29.932003 78.034902,30.19598 78.034902,30.447018 78.034902,30.906979 78.191946,31.202999 78.507926,31.335018 78.822927,31.466 79.481923,31.58099 80.483938,31.67901 L80.483938,32.484003 73.024955,32.484003 73.024955,31.67901 C73.72991,31.494015 74.24993,31.291012 74.583915,31.072018 75.077932,30.755001 75.62792,30.163021 76.234915,29.296991 z ";
 //pathContent1.horizontalAlignment='Stretch';
 pathContent1.width = 100;
 pathContent1.height = 100 ;

 var content1 = pathContent1;
 pathContent1.style.fill = 'yellow';
 pathContent1.style.strokeColor = "red";
 content.width = 200;
 content.height =100; 


let container: Canvas = new Canvas();
container.offsetX = 500;
container.offsetY = 500;
container.style.fill = 'transparent';
container.style.strokeColor = 'transparent';
container.horizontalAlignment = 'Left';
container.children = [content, textele];
container.measure(new Size);
container.arrange(container.desiredSize);
refreshDiagramElements(ele as HTMLCanvasElement, [container], renderer);

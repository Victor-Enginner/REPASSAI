/**
 * ARQUIVO GERADO — não editar à mão.
 * Origem: scripts/build-component-index.mjs
 * Regenerar com: npm run build:index
 */

export const COMPONENT_INDEX = {
  "versao": 1,
  "origem": "D:\\Site Pack Assets",
  "total": 104,
  "instalaveis": 102,
  "estatisticas": {
    "porEstilo": {
      "diverso": 24,
      "fluido": 13,
      "luz": 12,
      "navegacao": 8,
      "card": 9,
      "galeria": 4,
      "geometrico": 10,
      "tipografia": 1,
      "glitch": 3,
      "particulas": 11,
      "superficie": 4,
      "cursor": 5
    },
    "porDependencia": {
      "motion": 7,
      "ogl": 29,
      "three": 19,
      "@react-three/fiber": 7,
      "@react-three/drei": 5,
      "(nenhuma)": 28,
      "gsap": 17,
      "postprocessing": 3,
      "@react-three/postprocessing": 1,
      "@use-gesture/react": 1,
      "maath": 1,
      "face-api.js": 1,
      "gl-matrix": 1,
      "meshline": 1,
      "@react-three/rapier": 1,
      "lucide-react": 1,
      "lenis": 1
    }
  },
  "componentes": [
    {
      "id": "animated_list",
      "nome": "AnimatedList",
      "arquivo": "Animated List",
      "categoria": "component",
      "estilo": "diverso",
      "dependencias": [
        "motion"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "items",
          "tipo": "string[]",
          "padrao": "['Item 1', 'Item 2', ...]",
          "descricao": "An array of items to display in the scrollable list."
        },
        {
          "nome": "onItemSelect",
          "tipo": "function",
          "padrao": "undefined",
          "descricao": "Callback function triggered when an item is selected. Receives the selected item and its index."
        },
        {
          "nome": "showGradients",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Toggle to display the top and bottom gradient overlays."
        },
        {
          "nome": "enableArrowNavigation",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Toggle to enable keyboard navigation via arrow and tab keys."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "''",
          "descricao": "Additional CSS class names for the main container."
        },
        {
          "nome": "itemClassName",
          "tipo": "string",
          "padrao": "''",
          "descricao": "Additional CSS class names for each list item."
        },
        {
          "nome": "displayScrollbar",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Toggle to display or hide the custom scrollbar."
        },
        {
          "nome": "initialSelectedIndex",
          "tipo": "number",
          "padrao": "-1",
          "descricao": "Initial index of the selected item. Set to -1 for no selection."
        }
      ],
      "totalProps": 8,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 154,
      "keywords": [
        "animated",
        "list",
        "component",
        "motion",
        "items",
        "onitemselect",
        "showgradients",
        "enablearrownavigation",
        "classname",
        "itemclassname",
        "displayscrollbar",
        "initialselectedindex"
      ],
      "caminhoOrigem": "Components Animations\\Animated List.txt"
    },
    {
      "id": "aurora_integrate_the_aurora_component_from_react_bit",
      "nome": "Aurora",
      "arquivo": "Aurora ## Integrate the Aurora  component from React Bit",
      "categoria": "background",
      "estilo": "fluido",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [],
      "totalProps": 0,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 205,
      "keywords": [
        "aurora",
        "integrate",
        "the",
        "component",
        "from",
        "react",
        "bit",
        "background",
        "ogl"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Aurora ## Integrate the Aurora  component from React Bit.txt"
    },
    {
      "id": "balatro",
      "nome": "Balatro",
      "arquivo": "Balatro",
      "categoria": "background",
      "estilo": "diverso",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "spinRotation",
          "tipo": "number",
          "padrao": "-2.0",
          "descricao": "Base rotation amount affecting the shader effect."
        },
        {
          "nome": "spinSpeed",
          "tipo": "number",
          "padrao": "7.0",
          "descricao": "Speed of the spin animation."
        },
        {
          "nome": "offset",
          "tipo": "[number, number]",
          "padrao": "[0.0, 0.0]",
          "descricao": "Offset for the shader effect."
        },
        {
          "nome": "color1",
          "tipo": "string",
          "padrao": "\"#DE443B\"",
          "descricao": "Primary color in HEX format."
        },
        {
          "nome": "color2",
          "tipo": "string",
          "padrao": "\"#006BB4\"",
          "descricao": "Secondary color in HEX format."
        },
        {
          "nome": "color3",
          "tipo": "string",
          "padrao": "\"#162325\"",
          "descricao": "Tertiary color in HEX format."
        },
        {
          "nome": "contrast",
          "tipo": "number",
          "padrao": "3.5",
          "descricao": "Contrast value affecting color blending."
        },
        {
          "nome": "lighting",
          "tipo": "number",
          "padrao": "0.4",
          "descricao": "Lighting factor affecting brightness."
        },
        {
          "nome": "spinAmount",
          "tipo": "number",
          "padrao": "0.25",
          "descricao": "Amount of spin influence based on UV length."
        },
        {
          "nome": "pixelFilter",
          "tipo": "number",
          "padrao": "745.0",
          "descricao": "Pixel filter factor determining pixelation."
        },
        {
          "nome": "spinEase",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Ease factor for spin."
        },
        {
          "nome": "isRotate",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Determines if the shader rotates continuously."
        },
        {
          "nome": "mouseInteraction",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enables or disables mouse interaction for rotation."
        }
      ],
      "totalProps": 13,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 215,
      "keywords": [
        "balatro",
        "background",
        "ogl",
        "spinrotation",
        "spinspeed",
        "offset",
        "color1",
        "color2",
        "color3",
        "contrast",
        "lighting",
        "spinamount",
        "pixelfilter",
        "spinease",
        "isrotate"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Balatro.txt"
    },
    {
      "id": "ballbit",
      "nome": "Ballpit",
      "arquivo": "Ballbit",
      "categoria": "background",
      "estilo": "diverso",
      "dependencias": [
        "three"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "count",
          "tipo": "number",
          "padrao": "200",
          "descricao": "Sets the number of balls in the ballpit."
        },
        {
          "nome": "gravity",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Controls the gravity affecting the balls."
        },
        {
          "nome": "friction",
          "tipo": "number",
          "padrao": "0.9975",
          "descricao": "Sets the friction applied to the ball movement."
        },
        {
          "nome": "wallBounce",
          "tipo": "number",
          "padrao": "0.95",
          "descricao": "Determines how much balls bounce off walls."
        },
        {
          "nome": "followCursor",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enables or disables the sphere following the cursor."
        },
        {
          "nome": "colors",
          "tipo": "array",
          "padrao": "[0, 0, 0]",
          "descricao": "Defines the colors of the balls."
        },
        {
          "nome": "ambientColor",
          "tipo": "number",
          "padrao": "16777215",
          "descricao": "Sets the ambient light color."
        },
        {
          "nome": "ambientIntensity",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Controls the intensity of ambient light."
        },
        {
          "nome": "lightIntensity",
          "tipo": "number",
          "padrao": "200",
          "descricao": "Sets the intensity of the main light source."
        },
        {
          "nome": "minSize",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Specifies the minimum size of the balls."
        },
        {
          "nome": "maxSize",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Specifies the maximum size of the balls."
        },
        {
          "nome": "size0",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Initial size value for the cursor ball."
        },
        {
          "nome": "maxVelocity",
          "tipo": "number",
          "padrao": "0.15",
          "descricao": "Limits the maximum velocity of the balls."
        },
        {
          "nome": "maxX",
          "tipo": "number",
          "padrao": "5",
          "descricao": "Defines the maximum X-coordinate boundary."
        },
        {
          "nome": "maxY",
          "tipo": "number",
          "padrao": "5",
          "descricao": "Defines the maximum Y-coordinate boundary."
        }
      ],
      "totalProps": 15,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 429,
      "keywords": [
        "ballpit",
        "ballbit",
        "background",
        "three",
        "count",
        "gravity",
        "friction",
        "wallbounce",
        "followcursor",
        "colors",
        "ambientcolor",
        "ambientintensity",
        "lightintensity",
        "minsize",
        "maxsize",
        "size0"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Ballbit.txt"
    },
    {
      "id": "beams",
      "nome": "Beams",
      "arquivo": "Beams",
      "categoria": "background",
      "estilo": "luz",
      "dependencias": [
        "three",
        "@react-three/fiber",
        "@react-three/drei"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "beamWidth",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Width of each beam."
        },
        {
          "nome": "beamHeight",
          "tipo": "number",
          "padrao": "15",
          "descricao": "Height of each beam."
        },
        {
          "nome": "beamNumber",
          "tipo": "number",
          "padrao": "12",
          "descricao": "Number of beams to display."
        },
        {
          "nome": "lightColor",
          "tipo": "string",
          "padrao": "'#ffffff'",
          "descricao": "Color of the directional light."
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Speed of the animation."
        },
        {
          "nome": "noiseIntensity",
          "tipo": "number",
          "padrao": "1.75",
          "descricao": "Intensity of the noise effect overlay."
        },
        {
          "nome": "scale",
          "tipo": "number",
          "padrao": "0.2",
          "descricao": "Scale of the noise pattern."
        },
        {
          "nome": "rotation",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Rotation of the entire beams system in degrees."
        }
      ],
      "totalProps": 8,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 183,
      "keywords": [
        "beams",
        "background",
        "three",
        "@react-three/fiber",
        "@react-three/drei",
        "beamwidth",
        "beamheight",
        "beamnumber",
        "lightcolor",
        "speed",
        "noiseintensity",
        "scale",
        "rotation"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Beams.txt"
    },
    {
      "id": "border_glow",
      "nome": "BorderGlow",
      "arquivo": "Border Glow",
      "categoria": "component",
      "estilo": "luz",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "children",
          "tipo": "ReactNode",
          "padrao": "-",
          "descricao": "Content rendered inside the card."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "\"\"",
          "descricao": "Additional CSS classes for the outer wrapper."
        },
        {
          "nome": "edgeSensitivity",
          "tipo": "number",
          "padrao": "30",
          "descricao": "How close the pointer must be to the edge for the glow to appear (0-100)."
        },
        {
          "nome": "glowColor",
          "tipo": "string",
          "padrao": "\"40 80 80\"",
          "descricao": "HSL values for the glow color, as \"H S L\" (e.g. \"40 80 80\")."
        },
        {
          "nome": "backgroundColor",
          "tipo": "string",
          "padrao": "\"#120F17\"",
          "descricao": "Background color of the card."
        },
        {
          "nome": "borderRadius",
          "tipo": "number",
          "padrao": "28",
          "descricao": "Corner radius of the card in pixels."
        },
        {
          "nome": "glowRadius",
          "tipo": "number",
          "padrao": "40",
          "descricao": "How far the outer glow extends beyond the card in pixels."
        },
        {
          "nome": "glowIntensity",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Multiplier for glow opacity (0.1-3.0)."
        },
        {
          "nome": "coneSpread",
          "tipo": "number",
          "padrao": "25",
          "descricao": "Width of the directional cone mask as a percentage (5-45)."
        },
        {
          "nome": "animated",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Play an intro sweep animation on mount."
        },
        {
          "nome": "colors",
          "tipo": "string[]",
          "padrao": "[...]",
          "descricao": "Array of 3 hex colors for the mesh gradient border, distributed across positions."
        }
      ],
      "totalProps": 11,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 159,
      "keywords": [
        "border",
        "glow",
        "component",
        "children",
        "classname",
        "edgesensitivity",
        "glowcolor",
        "backgroundcolor",
        "borderradius",
        "glowradius",
        "glowintensity",
        "conespread",
        "animated",
        "colors"
      ],
      "caminhoOrigem": "Components Animations\\Border Glow.txt"
    },
    {
      "id": "bubble_menu",
      "nome": "BubbleMenu",
      "arquivo": "Bubble Menu",
      "categoria": "component",
      "estilo": "navegacao",
      "dependencias": [
        "gsap"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "logo",
          "tipo": "ReactNode",
          "padrao": "string",
          "descricao": "—"
        },
        {
          "nome": "onMenuClick",
          "tipo": "(open: boolean) => void",
          "padrao": "—",
          "descricao": "Callback fired whenever the menu toggle changes; receives open state."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "—",
          "descricao": "Additional class names for the root nav wrapper."
        },
        {
          "nome": "style",
          "tipo": "CSSProperties",
          "padrao": "—",
          "descricao": "Inline styles applied to the root nav wrapper."
        },
        {
          "nome": "menuAriaLabel",
          "tipo": "string",
          "padrao": "\"Toggle menu\"",
          "descricao": "Accessible aria-label for the toggle button."
        },
        {
          "nome": "menuBg",
          "tipo": "string",
          "padrao": "\"#fff\"",
          "descricao": "Background color for the logo & toggle bubbles and base pill background."
        },
        {
          "nome": "menuContentColor",
          "tipo": "string",
          "padrao": "\"#111\"",
          "descricao": "Color for the menu icon lines and default pill text."
        },
        {
          "nome": "useFixedPosition",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "If true positions the menu with fixed instead of absolute (follows viewport)."
        },
        {
          "nome": "items",
          "tipo": "MenuItem[]",
          "padrao": "DEFAULT_ITEMS",
          "descricao": "Custom menu items; each = { label, href, ariaLabel?, rotation?, hoverStyles?: { bgColor?, textColor? } }."
        },
        {
          "nome": "animationEase",
          "tipo": "string",
          "padrao": "\"back.out(1.5)\"",
          "descricao": "GSAP ease string used for bubble scale-in animation."
        },
        {
          "nome": "animationDuration",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Duration (s) for each bubble & label animation."
        },
        {
          "nome": "staggerDelay",
          "tipo": "number",
          "padrao": "0.12",
          "descricao": "Base stagger (s) between bubble animations (with slight random variance)."
        }
      ],
      "totalProps": 12,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 217,
      "keywords": [
        "bubble",
        "menu",
        "component",
        "gsap",
        "logo",
        "onmenuclick",
        "classname",
        "style",
        "menuarialabel",
        "menubg",
        "menucontentcolor",
        "usefixedposition",
        "items",
        "animationease",
        "animationduration",
        "staggerdelay"
      ],
      "caminhoOrigem": "Components Animations\\Bubble Menu.txt"
    },
    {
      "id": "card_nav",
      "nome": "CardNav",
      "arquivo": "Card Nav",
      "categoria": "component",
      "estilo": "card",
      "dependencias": [
        "gsap"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "logo",
          "tipo": "string",
          "padrao": "-",
          "descricao": "URL for the logo image"
        },
        {
          "nome": "logoAlt",
          "tipo": "string",
          "padrao": "Logo",
          "descricao": "Alt text for the logo image"
        },
        {
          "nome": "items",
          "tipo": "CardNavItem[]",
          "padrao": "-",
          "descricao": "Array of navigation items with label, bgColor, textColor, and links"
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "''",
          "descricao": "Additional CSS classes for the navigation container"
        },
        {
          "nome": "ease",
          "tipo": "string",
          "padrao": "power3.out",
          "descricao": "GSAP easing function for animations"
        },
        {
          "nome": "baseColor",
          "tipo": "string",
          "padrao": "#fff",
          "descricao": "Background color for the navigation container"
        },
        {
          "nome": "menuColor",
          "tipo": "string",
          "padrao": "undefined",
          "descricao": "Color for the hamburger menu lines"
        },
        {
          "nome": "buttonBgColor",
          "tipo": "string",
          "padrao": "#111",
          "descricao": "Background color for the CTA button"
        },
        {
          "nome": "buttonTextColor",
          "tipo": "string",
          "padrao": "white",
          "descricao": "Text color for the CTA button"
        }
      ],
      "totalProps": 9,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 200,
      "keywords": [
        "card",
        "nav",
        "component",
        "gsap",
        "logo",
        "logoalt",
        "items",
        "classname",
        "ease",
        "basecolor",
        "menucolor",
        "buttonbgcolor",
        "buttontextcolor"
      ],
      "caminhoOrigem": "Components Animations\\Card Nav.txt"
    },
    {
      "id": "card_swap",
      "nome": "CardSwap",
      "arquivo": "Card Swap",
      "categoria": "component",
      "estilo": "card",
      "dependencias": [
        "gsap"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "width",
          "tipo": "number",
          "padrao": "string",
          "descricao": "500"
        },
        {
          "nome": "height",
          "tipo": "number",
          "padrao": "string",
          "descricao": "400"
        },
        {
          "nome": "cardDistance",
          "tipo": "number",
          "padrao": "60",
          "descricao": "X-axis spacing between cards"
        },
        {
          "nome": "verticalDistance",
          "tipo": "number",
          "padrao": "70",
          "descricao": "Y-axis spacing between cards"
        },
        {
          "nome": "delay",
          "tipo": "number",
          "padrao": "5000",
          "descricao": "Milliseconds between card swaps"
        },
        {
          "nome": "pauseOnHover",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Whether to pause animation on hover"
        },
        {
          "nome": "onCardClick",
          "tipo": "(idx: number) => void",
          "padrao": "undefined",
          "descricao": "Callback function when a card is clicked"
        },
        {
          "nome": "skewAmount",
          "tipo": "number",
          "padrao": "6",
          "descricao": "Degree of slope for top/bottom edges"
        },
        {
          "nome": "easing",
          "tipo": "'linear'",
          "padrao": "'elastic'",
          "descricao": "'elastic'"
        },
        {
          "nome": "children",
          "tipo": "ReactNode",
          "padrao": "required",
          "descricao": "Card components to display in the stack"
        }
      ],
      "totalProps": 10,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 184,
      "keywords": [
        "card",
        "swap",
        "component",
        "gsap",
        "width",
        "height",
        "carddistance",
        "verticaldistance",
        "delay",
        "pauseonhover",
        "oncardclick",
        "skewamount",
        "easing",
        "children"
      ],
      "caminhoOrigem": "Components Animations\\Card Swap.txt"
    },
    {
      "id": "carousel",
      "nome": "Carousel",
      "arquivo": "Carousel",
      "categoria": "component",
      "estilo": "galeria",
      "dependencias": [
        "motion"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "items",
          "tipo": "CarouselItem[]",
          "padrao": "DEFAULT_ITEMS",
          "descricao": "An array of carousel items. Each item must include title, description, id, and icon."
        },
        {
          "nome": "baseWidth",
          "tipo": "number",
          "padrao": "300",
          "descricao": "Total width (in px) of the carousel container. Effective item width is baseWidth minus padding."
        },
        {
          "nome": "autoplay",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Enables automatic scrolling to the next item at a fixed interval."
        },
        {
          "nome": "autoplayDelay",
          "tipo": "number",
          "padrao": "3000",
          "descricao": "Delay in milliseconds between automatic scrolls when autoplay is enabled."
        },
        {
          "nome": "pauseOnHover",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Pauses the autoplay functionality when the carousel is hovered."
        },
        {
          "nome": "loop",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "When true, the carousel loops seamlessly from the last item back to the first."
        },
        {
          "nome": "round",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "When true, the carousel is rendered with a 1:1 aspect ratio and circular container/items."
        }
      ],
      "totalProps": 7,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 268,
      "keywords": [
        "carousel",
        "component",
        "motion",
        "items",
        "basewidth",
        "autoplay",
        "autoplaydelay",
        "pauseonhover",
        "loop",
        "round"
      ],
      "caminhoOrigem": "Components Animations\\Carousel.txt"
    },
    {
      "id": "chroma_grid",
      "nome": "ChromaGrid",
      "arquivo": "Chroma Grid",
      "categoria": "component",
      "estilo": "geometrico",
      "dependencias": [
        "gsap"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "items",
          "tipo": "Array",
          "padrao": "Demo []",
          "descricao": "Array of ChromaItem objects to display in the grid"
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "''",
          "descricao": "Additional CSS classes to apply to the grid container"
        },
        {
          "nome": "radius",
          "tipo": "number",
          "padrao": "300",
          "descricao": "Size of the spotlight effect in pixels"
        },
        {
          "nome": "damping",
          "tipo": "number",
          "padrao": "0.45",
          "descricao": "Cursor follow animation duration in seconds"
        },
        {
          "nome": "fadeOut",
          "tipo": "number",
          "padrao": "0.6",
          "descricao": "Fade-out animation duration in seconds when mouse leaves"
        },
        {
          "nome": "ease",
          "tipo": "string",
          "padrao": "'power3.out'",
          "descricao": "GSAP easing function for animations"
        }
      ],
      "totalProps": 6,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 177,
      "keywords": [
        "chroma",
        "grid",
        "component",
        "gsap",
        "items",
        "classname",
        "radius",
        "damping",
        "fadeout",
        "ease"
      ],
      "caminhoOrigem": "Components Animations\\Chroma Grid.txt"
    },
    {
      "id": "circular_gallery",
      "nome": "CircularGallery",
      "arquivo": "Circular Gallery",
      "categoria": "component",
      "estilo": "galeria",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "items",
          "tipo": "Array<{ image: string; text: string }>",
          "padrao": "undefined",
          "descricao": "List of items to display in the gallery. Each item should have an image URL and a text label."
        },
        {
          "nome": "bend",
          "tipo": "number",
          "padrao": "3",
          "descricao": "Determines the curvature of the gallery layout. A negative value bends in one direction, a positive value in the opposite."
        },
        {
          "nome": "textColor",
          "tipo": "string",
          "padrao": "\"#ffffff\"",
          "descricao": "Specifies the color of the text labels."
        },
        {
          "nome": "borderRadius",
          "tipo": "number",
          "padrao": "0.05",
          "descricao": "Sets the border radius for the media items to achieve rounded corners."
        },
        {
          "nome": "font",
          "tipo": "string",
          "padrao": "\"bold 30px Figtree\"",
          "descricao": "CSS font shorthand (style, weight, size, family) used for the text labels below each card."
        },
        {
          "nome": "fontUrl",
          "tipo": "string",
          "padrao": "undefined",
          "descricao": "URL of a font to load for the labels. Accepts a stylesheet URL (e.g. a Google Fonts link) or a direct font file (.woff2, .woff, .ttf, .otf). The loaded family overrides the family in `font`."
        },
        {
          "nome": "scrollSpeed",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Controls how much the gallery moves per scroll event. Lower values result in slower scrolling, higher values in faster scrolling."
        },
        {
          "nome": "scrollEase",
          "tipo": "number",
          "padrao": "0.05",
          "descricao": "Controls the smoothness of scroll transitions. Lower values create smoother, more fluid motion, while higher values make it more responsive."
        }
      ],
      "totalProps": 8,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 36,
      "keywords": [
        "circular",
        "gallery",
        "component",
        "ogl",
        "items",
        "bend",
        "textcolor",
        "borderradius",
        "font",
        "fonturl",
        "scrollspeed",
        "scrollease"
      ],
      "caminhoOrigem": "Components Animations\\Circular Gallery.txt"
    },
    {
      "id": "color_blends",
      "nome": "ColorBends",
      "arquivo": "Color blends",
      "categoria": "background",
      "estilo": "diverso",
      "dependencias": [
        "three"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "rotation",
          "tipo": "number",
          "padrao": "90",
          "descricao": "Base rotation angle in degrees."
        },
        {
          "nome": "autoRotate",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Automatic rotation speed in degrees/sec."
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "0.2",
          "descricao": "Animation time scale of the shader."
        },
        {
          "nome": "colors",
          "tipo": "string[]",
          "padrao": "[]",
          "descricao": "Palette of up to 8 hex colors used to blend the bends."
        },
        {
          "nome": "transparent",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Whether the background is transparent (uses alpha)."
        },
        {
          "nome": "scale",
          "tipo": "number",
          "padrao": "1",
          "descricao": ""
        }
      ],
      "totalProps": 6,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 320,
      "keywords": [
        "color",
        "bends",
        "blends",
        "background",
        "three",
        "rotation",
        "autorotate",
        "speed",
        "colors",
        "transparent",
        "scale"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Color blends.txt"
    },
    {
      "id": "counter",
      "nome": "Counter",
      "arquivo": "Counter",
      "categoria": "component",
      "estilo": "tipografia",
      "dependencias": [
        "motion"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "value",
          "tipo": "number",
          "padrao": "N/A (required)",
          "descricao": "The numeric value to display in the counter."
        },
        {
          "nome": "fontSize",
          "tipo": "number",
          "padrao": "100",
          "descricao": "The base font size used for the counter digits."
        },
        {
          "nome": "padding",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Additional padding added to the digit height."
        },
        {
          "nome": "places",
          "tipo": "number[]",
          "padrao": "[100, 10, 1 , \".\" , 0.1]",
          "descricao": "Defines which digit positions to display. Include whole number and decimal place values (use \".\" for the decimal point). If omitted, place values will be detected automatically."
        },
        {
          "nome": "gap",
          "tipo": "number",
          "padrao": "8",
          "descricao": "The gap (in pixels) between each digit."
        },
        {
          "nome": "borderRadius",
          "tipo": "number",
          "padrao": "4",
          "descricao": "The border radius (in pixels) for the counter container."
        },
        {
          "nome": "horizontalPadding",
          "tipo": "number",
          "padrao": "8",
          "descricao": "The horizontal padding (in pixels) for the counter container."
        },
        {
          "nome": "textColor",
          "tipo": "string",
          "padrao": "'white'",
          "descricao": "The text color for the counter digits."
        },
        {
          "nome": "fontWeight",
          "tipo": "string",
          "padrao": "number",
          "descricao": "'bold'"
        },
        {
          "nome": "containerStyle",
          "tipo": "React.CSSProperties",
          "padrao": "{}",
          "descricao": "Custom inline styles for the outer container."
        },
        {
          "nome": "counterStyle",
          "tipo": "React.CSSProperties",
          "padrao": "{}",
          "descricao": "Custom inline styles for the counter element."
        },
        {
          "nome": "digitStyle",
          "tipo": "React.CSSProperties",
          "padrao": "{}",
          "descricao": "Custom inline styles for each digit container."
        },
        {
          "nome": "gradientHeight",
          "tipo": "number",
          "padrao": "16",
          "descricao": "The height (in pixels) of the gradient overlays."
        },
        {
          "nome": "gradientFrom",
          "tipo": "string",
          "padrao": "'black'",
          "descricao": "The starting color for the gradient overlays."
        },
        {
          "nome": "gradientTo",
          "tipo": "string",
          "padrao": "'transparent'",
          "descricao": "The ending color for the gradient overlays."
        },
        {
          "nome": "topGradientStyle",
          "tipo": "React.CSSProperties",
          "padrao": "undefined",
          "descricao": "Custom inline styles for the top gradient overlay."
        },
        {
          "nome": "bottomGradientStyle",
          "tipo": "React.CSSProperties",
          "padrao": "undefined",
          "descricao": "Custom inline styles for the bottom gradient overlay."
        }
      ],
      "totalProps": 17,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 129,
      "keywords": [
        "counter",
        "component",
        "motion",
        "value",
        "fontsize",
        "padding",
        "places",
        "gap",
        "borderradius",
        "horizontalpadding",
        "textcolor",
        "fontweight",
        "containerstyle",
        "counterstyle",
        "digitstyle"
      ],
      "caminhoOrigem": "Components Animations\\Counter.txt"
    },
    {
      "id": "crossharis_xxxx",
      "nome": "Crosshair",
      "arquivo": "Crossharis xxxx",
      "categoria": "component",
      "estilo": "diverso",
      "dependencias": [
        "gsap"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "color",
          "tipo": "string",
          "padrao": "'white'",
          "descricao": "Color of the crosshair lines."
        },
        {
          "nome": "containerRef",
          "tipo": "RefObject<HTMLElement>",
          "padrao": "null",
          "descricao": "Optional container ref to limit crosshair to specific element. If null, crosshair will be active on entire viewport."
        }
      ],
      "totalProps": 2,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 198,
      "keywords": [
        "crosshair",
        "crossharis",
        "xxxx",
        "component",
        "gsap",
        "color",
        "containerref"
      ],
      "caminhoOrigem": "Components Animations\\Crossharis xxxx.txt"
    },
    {
      "id": "cubes",
      "nome": "Cubes",
      "arquivo": "Cubes",
      "categoria": "component",
      "estilo": "geometrico",
      "dependencias": [
        "gsap"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "gridSize",
          "tipo": "number",
          "padrao": "10",
          "descricao": "The size of the grid (number of cubes per row/column)"
        },
        {
          "nome": "cubeSize",
          "tipo": "number",
          "padrao": "undefined",
          "descricao": "Fixed size of each cube in pixels. If not provided, cubes will be responsive"
        },
        {
          "nome": "maxAngle",
          "tipo": "number",
          "padrao": "45",
          "descricao": "Maximum rotation angle for the tilt effect in degrees"
        },
        {
          "nome": "radius",
          "tipo": "number",
          "padrao": "3",
          "descricao": "Radius of the tilt effect (how many cubes around the cursor are affected)"
        },
        {
          "nome": "easing",
          "tipo": "string",
          "padrao": "'power3.out'",
          "descricao": "GSAP easing function for the tilt animation"
        },
        {
          "nome": "duration",
          "tipo": "object",
          "padrao": "{ enter: 0.3, leave: 0.6 }",
          "descricao": "Animation duration for enter and leave effects"
        },
        {
          "nome": "cellGap",
          "tipo": "number",
          "padrao": "object",
          "descricao": "undefined"
        },
        {
          "nome": "borderStyle",
          "tipo": "string",
          "padrao": "'1px solid #fff'",
          "descricao": "CSS border style for cube faces"
        },
        {
          "nome": "faceColor",
          "tipo": "string",
          "padrao": "'#120F17'",
          "descricao": "Background color for cube faces"
        },
        {
          "nome": "shadow",
          "tipo": "boolean",
          "padrao": "string",
          "descricao": "false"
        },
        {
          "nome": "autoAnimate",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Whether to automatically animate when user is idle"
        },
        {
          "nome": "rippleOnClick",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Whether to show ripple effect on click"
        },
        {
          "nome": "rippleColor",
          "tipo": "string",
          "padrao": "'#fff'",
          "descricao": "Color of the ripple effect"
        },
        {
          "nome": "rippleSpeed",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Speed multiplier for the ripple animation"
        }
      ],
      "totalProps": 14,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 290,
      "keywords": [
        "cubes",
        "component",
        "gsap",
        "gridsize",
        "cubesize",
        "maxangle",
        "radius",
        "easing",
        "duration",
        "cellgap",
        "borderstyle",
        "facecolor",
        "shadow",
        "autoanimate",
        "rippleonclick"
      ],
      "caminhoOrigem": "Components Animations\\Cubes.txt"
    },
    {
      "id": "cursor_grid",
      "nome": "CursorGrid",
      "arquivo": "Cursor Grid",
      "categoria": "component",
      "estilo": "geometrico",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "cellSize",
          "tipo": "number",
          "padrao": "70",
          "descricao": "Size of each grid cell in pixels."
        },
        {
          "nome": "color",
          "tipo": "string",
          "padrao": "\"#D946EF\"",
          "descricao": "Color of the cell strokes, fills and pulses."
        },
        {
          "nome": "radius",
          "tipo": "number",
          "padrao": "140",
          "descricao": "Radius in pixels around the cursor within which cells light up."
        },
        {
          "nome": "falloff",
          "tipo": "\"linear\"",
          "padrao": "\"smooth\"",
          "descricao": "\"sharp\""
        },
        {
          "nome": "holdTime",
          "tipo": "number",
          "padrao": "400",
          "descricao": "How long in milliseconds a cell stays lit before it starts fading."
        },
        {
          "nome": "fadeDuration",
          "tipo": "number",
          "padrao": "800",
          "descricao": "How long in milliseconds a fully lit cell takes to fade out."
        },
        {
          "nome": "lineWidth",
          "tipo": "number",
          "padrao": "1.2",
          "descricao": "Stroke width of the cell outlines."
        },
        {
          "nome": "maxOpacity",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Peak opacity of a cell at the cursor position."
        },
        {
          "nome": "fillOpacity",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Translucent fill of lit cells; 0 disables the fill."
        },
        {
          "nome": "gridOpacity",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Opacity of a faint always-visible lattice; 0 hides it."
        },
        {
          "nome": "cellRadius",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Corner radius of the cells in pixels."
        },
        {
          "nome": "clickPulse",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Emit an expanding ring of lit cells on click."
        },
        {
          "nome": "pulseSpeed",
          "tipo": "number",
          "padrao": "600",
          "descricao": "Expansion speed of the click ring in pixels per second."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "\"\"",
          "descricao": "Additional CSS classes for the wrapper."
        }
      ],
      "totalProps": 14,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 288,
      "keywords": [
        "cursor",
        "grid",
        "component",
        "cellsize",
        "color",
        "radius",
        "falloff",
        "holdtime",
        "fadeduration",
        "linewidth",
        "maxopacity",
        "fillopacity",
        "gridopacity",
        "cellradius",
        "clickpulse"
      ],
      "caminhoOrigem": "Components Animations\\Cursor Grid.txt"
    },
    {
      "id": "dark_veil",
      "nome": "DarkVeil",
      "arquivo": "Dark Veil",
      "categoria": "background",
      "estilo": "diverso",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [],
      "totalProps": 0,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 151,
      "keywords": [
        "dark",
        "veil",
        "background",
        "ogl"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Dark Veil.txt"
    },
    {
      "id": "decay_card",
      "nome": "DecayCard",
      "arquivo": "Decay Card",
      "categoria": "component",
      "estilo": "glitch",
      "dependencias": [
        "gsap"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "children",
          "tipo": "ReactNode",
          "padrao": "—",
          "descricao": "The content (JSX) to be rendered inside the card."
        },
        {
          "nome": "width",
          "tipo": "number",
          "padrao": "300",
          "descricao": "The width of the card in pixels."
        },
        {
          "nome": "height",
          "tipo": "number",
          "padrao": "400",
          "descricao": "The height of the card in pixels."
        },
        {
          "nome": "image",
          "tipo": "string",
          "padrao": "—",
          "descricao": "Allows setting the background image of the card."
        },
        {
          "nome": "baseFrequency",
          "tipo": "number",
          "padrao": "0.015",
          "descricao": "Base frequency for the turbulence filter. Lower values create larger, smoother patterns."
        },
        {
          "nome": "numOctaves",
          "tipo": "number",
          "padrao": "5",
          "descricao": "Number of octaves for the turbulence filter. Higher values add finer detail."
        },
        {
          "nome": "seed",
          "tipo": "number",
          "padrao": "4",
          "descricao": "Seed value for the turbulence random number generator."
        },
        {
          "nome": "maxDisplacement",
          "tipo": "number",
          "padrao": "400",
          "descricao": "Maximum displacement scale applied when the cursor moves. Controls the intensity of the decay effect."
        },
        {
          "nome": "movementBound",
          "tipo": "number",
          "padrao": "50",
          "descricao": "Maximum pixel distance the card can translate from its origin when following the cursor."
        }
      ],
      "totalProps": 9,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 69,
      "keywords": [
        "decay",
        "card",
        "component",
        "gsap",
        "children",
        "width",
        "height",
        "image",
        "basefrequency",
        "numoctaves",
        "seed",
        "maxdisplacement",
        "movementbound"
      ],
      "caminhoOrigem": "Components Animations\\Decay Card.txt"
    },
    {
      "id": "dither",
      "nome": "Dither",
      "arquivo": "Dither",
      "categoria": "background",
      "estilo": "geometrico",
      "dependencias": [
        "three",
        "postprocessing",
        "@react-three/fiber",
        "@react-three/postprocessing"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "waveSpeed",
          "tipo": "number",
          "padrao": "0.05",
          "descricao": "Speed of the wave animation."
        },
        {
          "nome": "waveFrequency",
          "tipo": "number",
          "padrao": "3",
          "descricao": "Frequency of the wave pattern."
        },
        {
          "nome": "waveAmplitude",
          "tipo": "number",
          "padrao": "0.3",
          "descricao": "Amplitude of the wave pattern."
        },
        {
          "nome": "waveColor",
          "tipo": "[number, number, number]",
          "padrao": "[0.5, 0.5, 0.5]",
          "descricao": "Color of the wave, defined as an RGB array."
        },
        {
          "nome": "colorNum",
          "tipo": "number",
          "padrao": "4",
          "descricao": "Number of colors to use in the dithering effect."
        },
        {
          "nome": "pixelSize",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Size of the pixels for the dithering effect."
        },
        {
          "nome": "disableAnimation",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Disable the wave animation when true."
        },
        {
          "nome": "enableMouseInteraction",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enables mouse interaction to influence the wave effect."
        },
        {
          "nome": "mouseRadius",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Radius for the mouse interaction effect."
        }
      ],
      "totalProps": 9,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 299,
      "keywords": [
        "dither",
        "background",
        "three",
        "postprocessing",
        "@react-three/fiber",
        "@react-three/postprocessing",
        "wavespeed",
        "wavefrequency",
        "waveamplitude",
        "wavecolor",
        "colornum",
        "pixelsize",
        "disableanimation",
        "enablemouseinteraction",
        "mouseradius"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Dither.txt"
    },
    {
      "id": "dock",
      "nome": "Dock",
      "arquivo": "Dock",
      "categoria": "component",
      "estilo": "navegacao",
      "dependencias": [
        "motion"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "items",
          "tipo": "DockItemData[]",
          "padrao": "[]",
          "descricao": "Array of dock items. Each item should include an icon, label, onClick handler, and an optional className."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "\"\"",
          "descricao": "Additional CSS classes for the dock panel."
        },
        {
          "nome": "distance",
          "tipo": "number",
          "padrao": "200",
          "descricao": "Pixel distance used to calculate the magnification effect based on mouse proximity."
        },
        {
          "nome": "panelHeight",
          "tipo": "number",
          "padrao": "68",
          "descricao": "Height (in pixels) of the dock panel."
        },
        {
          "nome": "baseItemSize",
          "tipo": "number",
          "padrao": "50",
          "descricao": "The base size (in pixels) for each dock item."
        },
        {
          "nome": "dockHeight",
          "tipo": "number",
          "padrao": "256",
          "descricao": "Maximum height (in pixels) of the dock container."
        },
        {
          "nome": "magnification",
          "tipo": "number",
          "padrao": "70",
          "descricao": "The magnified size (in pixels) applied to a dock item when hovered."
        },
        {
          "nome": "spring",
          "tipo": "SpringOptions",
          "padrao": "{ mass: 0.1, stiffness: 150, damping: 12 }",
          "descricao": "Configuration options for the spring animation."
        }
      ],
      "totalProps": 8,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 146,
      "keywords": [
        "dock",
        "component",
        "motion",
        "items",
        "classname",
        "distance",
        "panelheight",
        "baseitemsize",
        "dockheight",
        "magnification",
        "spring"
      ],
      "caminhoOrigem": "Components Animations\\Dock.txt"
    },
    {
      "id": "dome_gallery",
      "nome": "DomeGallery",
      "arquivo": "Dome Gallery",
      "categoria": "component",
      "estilo": "galeria",
      "dependencias": [
        "@use-gesture/react"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "images",
          "tipo": "(string",
          "padrao": "{ src: string; alt?: string })[]",
          "descricao": "DEFAULT_IMAGES"
        },
        {
          "nome": "fit",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Size factor for the dome radius based on container dimensions"
        },
        {
          "nome": "fitBasis",
          "tipo": "'auto'",
          "padrao": "'min'",
          "descricao": "'max'"
        },
        {
          "nome": "minRadius",
          "tipo": "number",
          "padrao": "600",
          "descricao": "Minimum radius for the dome in pixels"
        },
        {
          "nome": "maxRadius",
          "tipo": "number",
          "padrao": "Infinity",
          "descricao": "Maximum radius for the dome in pixels"
        },
        {
          "nome": "padFactor",
          "tipo": "number",
          "padrao": "0.25",
          "descricao": "Padding factor for the viewer area"
        },
        {
          "nome": "overlayBlurColor",
          "tipo": "string",
          "padrao": "'#120F17'",
          "descricao": "Color for the outer portion of the radial overlay blur"
        },
        {
          "nome": "maxVerticalRotationDeg",
          "tipo": "number",
          "padrao": "5",
          "descricao": "Maximum vertical rotation angle in degrees"
        },
        {
          "nome": "dragSensitivity",
          "tipo": "number",
          "padrao": "20",
          "descricao": "Sensitivity of drag interactions"
        },
        {
          "nome": "enlargeTransitionMs",
          "tipo": "number",
          "padrao": "300",
          "descricao": "Duration of image enlargement transition in milliseconds"
        },
        {
          "nome": "segments",
          "tipo": "number",
          "padrao": "35",
          "descricao": "Number of segments for both X and Y to keep the dome proportional"
        },
        {
          "nome": "dragDampening",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Damping factor for drag inertia (0-1, higher = more damping)"
        },
        {
          "nome": "openedImageWidth",
          "tipo": "string",
          "padrao": "'400px'",
          "descricao": "Width of the enlarged image"
        },
        {
          "nome": "openedImageHeight",
          "tipo": "string",
          "padrao": "'400px'",
          "descricao": "Height of the enlarged image"
        },
        {
          "nome": "imageBorderRadius",
          "tipo": "string",
          "padrao": "'30px'",
          "descricao": "Border radius for closed tile images"
        },
        {
          "nome": "openedImageBorderRadius",
          "tipo": "string",
          "padrao": "'30px'",
          "descricao": "Border radius for opened/enlarged images"
        },
        {
          "nome": "grayscale",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Whether to render all images in grayscale"
        }
      ],
      "totalProps": 17,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 165,
      "keywords": [
        "dome",
        "gallery",
        "component",
        "@use-gesture/react",
        "images",
        "fit",
        "fitbasis",
        "minradius",
        "maxradius",
        "padfactor",
        "overlayblurcolor",
        "maxverticalrotationdeg",
        "dragsensitivity",
        "enlargetransitionms",
        "segments",
        "dragdampening"
      ],
      "caminhoOrigem": "Components Animations\\Dome Gallery.txt"
    },
    {
      "id": "dot_field",
      "nome": "DotField",
      "arquivo": "Dot Field",
      "categoria": "background",
      "estilo": "particulas",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "dotRadius",
          "tipo": "number",
          "padrao": "1.5",
          "descricao": "Radius of each individual dot in the grid."
        },
        {
          "nome": "dotSpacing",
          "tipo": "number",
          "padrao": "14",
          "descricao": "Spacing between dots in the grid."
        },
        {
          "nome": "cursorRadius",
          "tipo": "number",
          "padrao": "500",
          "descricao": "Radius of the cursor interaction area."
        },
        {
          "nome": "cursorForce",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "Force applied to dots when not in bulge mode."
        },
        {
          "nome": "bulgeOnly",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "When true, dots bulge away from cursor. When false, dots are pushed with physics."
        },
        {
          "nome": "bulgeStrength",
          "tipo": "number",
          "padrao": "67",
          "descricao": "Strength of the bulge effect around the cursor."
        },
        {
          "nome": "glowRadius",
          "tipo": "number",
          "padrao": "160",
          "descricao": "Radius of the SVG glow effect that follows the cursor."
        },
        {
          "nome": "sparkle",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "When enabled, ~3% of dots randomly sparkle at a larger size."
        },
        {
          "nome": "waveAmplitude",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Amplitude of the wave displacement animation applied to dots."
        },
        {
          "nome": "gradientFrom",
          "tipo": "string",
          "padrao": "'rgba(168, 85, 247, 0.35)'",
          "descricao": "Start color of the diagonal gradient applied to dots."
        },
        {
          "nome": "gradientTo",
          "tipo": "string",
          "padrao": "'rgba(180, 151, 207, 0.25)'",
          "descricao": "End color of the diagonal gradient applied to dots."
        },
        {
          "nome": "glowColor",
          "tipo": "string",
          "padrao": "'#120F17'",
          "descricao": "Color of the radial glow effect that follows the cursor."
        }
      ],
      "totalProps": 12,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 277,
      "keywords": [
        "dot",
        "field",
        "background",
        "dotradius",
        "dotspacing",
        "cursorradius",
        "cursorforce",
        "bulgeonly",
        "bulgestrength",
        "glowradius",
        "sparkle",
        "waveamplitude",
        "gradientfrom",
        "gradientto",
        "glowcolor"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Dot Field.txt"
    },
    {
      "id": "dot_grid",
      "nome": "DotGrid",
      "arquivo": "Dot Grid",
      "categoria": "background",
      "estilo": "particulas",
      "dependencias": [
        "gsap"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "dotSize",
          "tipo": "number",
          "padrao": "16",
          "descricao": "Size of each dot in pixels."
        },
        {
          "nome": "gap",
          "tipo": "number",
          "padrao": "32",
          "descricao": "Gap between each dot in pixels."
        },
        {
          "nome": "baseColor",
          "tipo": "string",
          "padrao": "'#5227FF'",
          "descricao": "Base color of the dots."
        },
        {
          "nome": "activeColor",
          "tipo": "string",
          "padrao": "'#5227FF'",
          "descricao": "Color of dots when hovered or activated."
        },
        {
          "nome": "proximity",
          "tipo": "number",
          "padrao": "150",
          "descricao": "Radius around the mouse pointer within which dots react."
        },
        {
          "nome": "speedTrigger",
          "tipo": "number",
          "padrao": "100",
          "descricao": "Mouse speed threshold to trigger inertia effect."
        },
        {
          "nome": "shockRadius",
          "tipo": "number",
          "padrao": "250",
          "descricao": "Radius of the shockwave effect on click."
        },
        {
          "nome": "shockStrength",
          "tipo": "number",
          "padrao": "5",
          "descricao": "Strength of the shockwave effect on click."
        },
        {
          "nome": "maxSpeed",
          "tipo": "number",
          "padrao": "5000",
          "descricao": "Maximum speed for inertia calculation."
        },
        {
          "nome": "resistance",
          "tipo": "number",
          "padrao": "750",
          "descricao": "Resistance for the inertia effect."
        },
        {
          "nome": "returnDuration",
          "tipo": "number",
          "padrao": "1.5",
          "descricao": "Duration for dots to return to their original position after inertia."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "''",
          "descricao": "Additional CSS classes for the component."
        },
        {
          "nome": "style",
          "tipo": "React.CSSProperties",
          "padrao": "{}",
          "descricao": "Inline styles for the component."
        }
      ],
      "totalProps": 13,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 271,
      "keywords": [
        "dot",
        "grid",
        "background",
        "gsap",
        "dotsize",
        "gap",
        "basecolor",
        "activecolor",
        "proximity",
        "speedtrigger",
        "shockradius",
        "shockstrength",
        "maxspeed",
        "resistance",
        "returnduration",
        "classname"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Dot Grid.txt"
    },
    {
      "id": "eletric_border",
      "nome": "ElectricBorder",
      "arquivo": "Eletric Border",
      "categoria": "component",
      "estilo": "superficie",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "color",
          "tipo": "string",
          "padrao": "\"#5227FF\"",
          "descricao": "Stroke/glow color. Any CSS color (hex, rgb, hsl)."
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Animation speed multiplier (higher = faster)."
        },
        {
          "nome": "chaos",
          "tipo": "number",
          "padrao": "0.12",
          "descricao": "Distortion intensity (0 = no distortion, higher = more chaotic)."
        },
        {
          "nome": "borderRadius",
          "tipo": "number",
          "padrao": "24",
          "descricao": "Border radius in pixels for the electric border path."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "—",
          "descricao": "Optional className applied to the root wrapper."
        },
        {
          "nome": "style",
          "tipo": "React.CSSProperties",
          "padrao": "—",
          "descricao": "Inline styles for the wrapper."
        },
        {
          "nome": "children",
          "tipo": "ReactNode",
          "padrao": "—",
          "descricao": "Content rendered inside the bordered container."
        }
      ],
      "totalProps": 7,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 300,
      "keywords": [
        "electric",
        "border",
        "eletric",
        "component",
        "color",
        "speed",
        "chaos",
        "borderradius",
        "classname",
        "style",
        "children"
      ],
      "caminhoOrigem": "Components Animations\\Eletric Border.txt"
    },
    {
      "id": "evil_eye",
      "nome": "EvilEye",
      "arquivo": "Evil Eye",
      "categoria": "background",
      "estilo": "diverso",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "eyeColor",
          "tipo": "string",
          "padrao": "\"#FF6F37\"",
          "descricao": "Primary eye color in HEX format."
        },
        {
          "nome": "intensity",
          "tipo": "number",
          "padrao": "1.5",
          "descricao": "Brightness / HDR intensity of the eye color."
        },
        {
          "nome": "pupilSize",
          "tipo": "number",
          "padrao": "0.6",
          "descricao": "Size and darkness of the pupil slit."
        },
        {
          "nome": "irisWidth",
          "tipo": "number",
          "padrao": "0.25",
          "descricao": "Width of the main iris ring."
        },
        {
          "nome": "glowIntensity",
          "tipo": "number",
          "padrao": "0.35",
          "descricao": "Strength of the outer eye glow."
        },
        {
          "nome": "scale",
          "tipo": "number",
          "padrao": "0.8",
          "descricao": ""
        }
      ],
      "totalProps": 6,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 269,
      "keywords": [
        "evil",
        "eye",
        "background",
        "ogl",
        "eyecolor",
        "intensity",
        "pupilsize",
        "iriswidth",
        "glowintensity",
        "scale"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Evil Eye.txt"
    },
    {
      "id": "faulty_terminal",
      "nome": "FaultyTerminal",
      "arquivo": "Faulty Terminal",
      "categoria": "background",
      "estilo": "glitch",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "scale",
          "tipo": "number",
          "padrao": "1.5",
          "descricao": "Controls the zoom/scale of the pattern."
        },
        {
          "nome": "gridMul",
          "tipo": "Vec2",
          "padrao": "[2, 1]",
          "descricao": "Grid multiplier for glyph density [x, y]."
        },
        {
          "nome": "digitSize",
          "tipo": "number",
          "padrao": "1.2",
          "descricao": "Size of individual glyphs."
        },
        {
          "nome": "timeScale",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Animation speed multiplier."
        },
        {
          "nome": "pause",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Pause/resume animation."
        },
        {
          "nome": "scanlineIntensity",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Strength of scanline effects."
        },
        {
          "nome": "glitchAmount",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Glitch displacement intensity."
        },
        {
          "nome": "flickerAmount",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Flicker effect strength."
        },
        {
          "nome": "noiseAmp",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Noise pattern amplitude."
        },
        {
          "nome": "chromaticAberration",
          "tipo": "number",
          "padrao": "0",
          "descricao": "RGB channel separation in pixels."
        },
        {
          "nome": "dither",
          "tipo": "number",
          "padrao": "boolean",
          "descricao": "0"
        },
        {
          "nome": "curvature",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Barrel distortion amount."
        },
        {
          "nome": "tint",
          "tipo": "string",
          "padrao": "'#ffffff'",
          "descricao": "Color tint (hex)."
        },
        {
          "nome": "mouseReact",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enable/disable mouse interaction."
        },
        {
          "nome": "mouseStrength",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Mouse interaction intensity."
        },
        {
          "nome": "pageLoadAnimation",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Enable fade-in animation on load."
        },
        {
          "nome": "brightness",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Overall opacity/brightness control."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "''",
          "descricao": "Additional CSS classes."
        },
        {
          "nome": "style",
          "tipo": "React.CSSProperties",
          "padrao": "{}",
          "descricao": "Inline styles."
        }
      ],
      "totalProps": 19,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 403,
      "keywords": [
        "faulty",
        "terminal",
        "background",
        "ogl",
        "scale",
        "gridmul",
        "digitsize",
        "timescale",
        "pause",
        "scanlineintensity",
        "glitchamount",
        "flickeramount",
        "noiseamp",
        "chromaticaberration",
        "dither",
        "curvature"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Faulty Terminal.txt"
    },
    {
      "id": "ferrofluid",
      "nome": "Ferrofluid",
      "arquivo": "Ferrofluid",
      "categoria": "background",
      "estilo": "fluido",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "colors",
          "tipo": "string[]",
          "padrao": "['#4F46E5', '#06B6D4', '#E0F2FE']",
          "descricao": "Array of hex colors (up to 8) used to tint the fluid rim. Colors are spread across the surface by height; a single color makes the whole effect uniform."
        },
        {
          "nome": "backgroundColor",
          "tipo": "string",
          "padrao": "'#03010A'",
          "descricao": "Hex color of the background behind the fluid."
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Multiplier for how fast the fluid churns and flows."
        },
        {
          "nome": "scale",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Overall feature size. Higher values zoom in for larger, fewer blobs."
        },
        {
          "nome": "turbulence",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Amount of domain distortion. Higher values create more chaotic, swirling motion."
        },
        {
          "nome": "fluidity",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "Smoothness of the merge between the two fluid layers. Higher = softer, more liquid blending."
        },
        {
          "nome": "rimWidth",
          "tipo": "number",
          "padrao": "0.2",
          "descricao": "Thickness of the glowing contour lines tracing the fluid surface."
        },
        {
          "nome": "sharpness",
          "tipo": "number",
          "padrao": "3",
          "descricao": "Contrast of the rim highlights. Higher values give crisper, thinner edges."
        },
        {
          "nome": "shimmer",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Amount of fine grainy break-up applied to the rim. 0 = smooth lines."
        },
        {
          "nome": "glow",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Overall brightness multiplier of the rim highlights."
        },
        {
          "nome": "flowDirection",
          "tipo": "'up'",
          "padrao": "'down'",
          "descricao": "'left'"
        },
        {
          "nome": "opacity",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Overall alpha of the rendered canvas."
        },
        {
          "nome": "mouseInteraction",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enables a magnetic spike that rises and glows under the cursor."
        },
        {
          "nome": "mouseStrength",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Intensity of the magnetic cursor spike."
        },
        {
          "nome": "mouseRadius",
          "tipo": "number",
          "padrao": "0.3",
          "descricao": "Falloff radius of the magnetic cursor spike."
        },
        {
          "nome": "mouseDampening",
          "tipo": "number",
          "padrao": "0.15",
          "descricao": "Easing time constant (seconds) for the cursor to follow the pointer. 0 = immediate."
        },
        {
          "nome": "mixBlendMode",
          "tipo": "string",
          "padrao": "undefined",
          "descricao": "CSS mix-blend-mode applied to the canvas (e.g. 'screen', 'lighten')."
        },
        {
          "nome": "paused",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "If true, stops rendering updates (freezing the current frame)."
        },
        {
          "nome": "dpr",
          "tipo": "number",
          "padrao": "window.devicePixelRatio",
          "descricao": "Overrides device pixel ratio; lower for performance, higher for sharpness."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "—",
          "descricao": "Additional class names for the root container."
        }
      ],
      "totalProps": 20,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 384,
      "keywords": [
        "ferrofluid",
        "background",
        "ogl",
        "colors",
        "backgroundcolor",
        "speed",
        "scale",
        "turbulence",
        "fluidity",
        "rimwidth",
        "sharpness",
        "shimmer",
        "glow",
        "flowdirection",
        "opacity"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Ferrofluid.txt"
    },
    {
      "id": "floating_liens",
      "nome": "FloatingLines",
      "arquivo": "Floating Liens",
      "categoria": "background",
      "estilo": "diverso",
      "dependencias": [
        "three"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "linesGradient",
          "tipo": "string[]",
          "padrao": "undefined",
          "descricao": "Array of hex color strings for gradient coloring of lines (max 8 colors)."
        },
        {
          "nome": "enabledWaves",
          "tipo": "Array<'top'",
          "padrao": "'middle'",
          "descricao": "'bottom'>"
        },
        {
          "nome": "lineCount",
          "tipo": "number",
          "padrao": "number[]",
          "descricao": "[6]"
        },
        {
          "nome": "lineDistance",
          "tipo": "number",
          "padrao": "number[]",
          "descricao": "[5]"
        },
        {
          "nome": "topWavePosition",
          "tipo": "{ x: number; y: number; rotate: number }",
          "padrao": "undefined",
          "descricao": "Position and rotation settings for the top wave layer."
        },
        {
          "nome": "middleWavePosition",
          "tipo": "{ x: number; y: number; rotate: number }",
          "padrao": "undefined",
          "descricao": "Position and rotation settings for the middle wave layer."
        },
        {
          "nome": "bottomWavePosition",
          "tipo": "{ x: number; y: number; rotate: number }",
          "padrao": "{ x: 2.0, y: -0.7, rotate: -1 }",
          "descricao": "Position and rotation settings for the bottom wave layer."
        },
        {
          "nome": "animationSpeed",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Speed multiplier for the wave animation."
        },
        {
          "nome": "interactive",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Whether the lines react to mouse/pointer movement."
        },
        {
          "nome": "bendRadius",
          "tipo": "number",
          "padrao": "10.0",
          "descricao": "Radius of the area affected by mouse interaction."
        },
        {
          "nome": "bendStrength",
          "tipo": "number",
          "padrao": "-5.0",
          "descricao": "Intensity of the bend effect when interacting with mouse."
        },
        {
          "nome": "mouseDamping",
          "tipo": "number",
          "padrao": "0.05",
          "descricao": "Smoothing factor for mouse movement tracking (0-1)."
        },
        {
          "nome": "parallax",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enable parallax effect with mouse movement."
        },
        {
          "nome": "parallaxStrength",
          "tipo": "number",
          "padrao": "0.2",
          "descricao": "Strength of the parallax effect."
        },
        {
          "nome": "mixBlendMode",
          "tipo": "React.CSSProperties['mixBlendMode']",
          "padrao": "'screen'",
          "descricao": "CSS mix-blend-mode applied to the canvas element."
        }
      ],
      "totalProps": 15,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 494,
      "keywords": [
        "floating",
        "lines",
        "liens",
        "background",
        "three",
        "linesgradient",
        "enabledwaves",
        "linecount",
        "linedistance",
        "topwaveposition",
        "middlewaveposition",
        "bottomwaveposition",
        "animationspeed",
        "interactive",
        "bendradius",
        "bendstrength",
        "mousedamping"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Floating Liens.txt"
    },
    {
      "id": "flowing_menu",
      "nome": "FlowingMenu",
      "arquivo": "Flowing Menu",
      "categoria": "component",
      "estilo": "navegacao",
      "dependencias": [
        "gsap"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "items",
          "tipo": "object[]",
          "padrao": "[]",
          "descricao": "An array of objects containing: link, text, image."
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "15",
          "descricao": "Duration of the marquee animation in seconds (lower = faster)."
        },
        {
          "nome": "textColor",
          "tipo": "string",
          "padrao": "#ffffff",
          "descricao": "Color of the static menu text."
        },
        {
          "nome": "bgColor",
          "tipo": "string",
          "padrao": "#120F17",
          "descricao": "Background color of the menu container."
        },
        {
          "nome": "marqueeBgColor",
          "tipo": "string",
          "padrao": "#ffffff",
          "descricao": "Background color of the marquee overlay."
        },
        {
          "nome": "marqueeTextColor",
          "tipo": "string",
          "padrao": "#120F17",
          "descricao": "Text color inside the marquee."
        },
        {
          "nome": "borderColor",
          "tipo": "string",
          "padrao": "#ffffff",
          "descricao": "Color of the dividing lines between menu items."
        }
      ],
      "totalProps": 7,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 168,
      "keywords": [
        "flowing",
        "menu",
        "component",
        "gsap",
        "items",
        "speed",
        "textcolor",
        "bgcolor",
        "marqueebgcolor",
        "marqueetextcolor",
        "bordercolor"
      ],
      "caminhoOrigem": "Components Animations\\Flowing Menu.txt"
    },
    {
      "id": "fluid_glass",
      "nome": "FluidGlass",
      "arquivo": "Fluid Glass",
      "categoria": "component",
      "estilo": "fluido",
      "dependencias": [
        "three",
        "@react-three/fiber",
        "@react-three/drei",
        "maath"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "mode",
          "tipo": "string",
          "padrao": "'lens'",
          "descricao": "Display mode of the fluid glass effect. Options: 'lens', 'bar', 'cube'"
        },
        {
          "nome": "lensProps",
          "tipo": "object",
          "padrao": "{}",
          "descricao": "Props specific to lens mode including material properties like ior, thickness, transmission"
        },
        {
          "nome": "barProps",
          "tipo": "object",
          "padrao": "{}",
          "descricao": "Props specific to bar mode including navItems array and material properties"
        },
        {
          "nome": "cubeProps",
          "tipo": "object",
          "padrao": "{}",
          "descricao": "Props specific to cube mode including material properties and interaction settings"
        }
      ],
      "totalProps": 4,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 280,
      "keywords": [
        "fluid",
        "glass",
        "component",
        "three",
        "@react-three/fiber",
        "@react-three/drei",
        "maath",
        "mode",
        "lensprops",
        "barprops",
        "cubeprops"
      ],
      "caminhoOrigem": "Components Animations\\Fluid Glass.txt"
    },
    {
      "id": "flying_posters",
      "nome": "FlyingPosters",
      "arquivo": "Flying Posters",
      "categoria": "component",
      "estilo": "galeria",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "items",
          "tipo": "string[]",
          "padrao": "[]",
          "descricao": "An array of image URLs to be displayed as flying posters."
        },
        {
          "nome": "planeWidth",
          "tipo": "number",
          "padrao": "320",
          "descricao": "The width of each poster plane in pixels."
        },
        {
          "nome": "planeHeight",
          "tipo": "number",
          "padrao": "320",
          "descricao": "The height of each poster plane in pixels."
        },
        {
          "nome": "distortion",
          "tipo": "number",
          "padrao": "3",
          "descricao": "The amount of distortion applied to the posters' movement."
        },
        {
          "nome": "scrollEase",
          "tipo": "number",
          "padrao": "0.01",
          "descricao": "The easing factor for smooth scrolling interactions."
        },
        {
          "nome": "cameraFov",
          "tipo": "number",
          "padrao": "45",
          "descricao": "The field of view for the camera in degrees."
        }
      ],
      "totalProps": 6,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 249,
      "keywords": [
        "flying",
        "posters",
        "component",
        "ogl",
        "items",
        "planewidth",
        "planeheight",
        "distortion",
        "scrollease",
        "camerafov"
      ],
      "caminhoOrigem": "Components Animations\\Flying Posters.txt"
    },
    {
      "id": "folder",
      "nome": "Folder",
      "arquivo": "Folder",
      "categoria": "component",
      "estilo": "card",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "color",
          "tipo": "string",
          "padrao": "#5227FF",
          "descricao": "The primary color of the folder."
        },
        {
          "nome": "size",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Scale factor for the folder size."
        },
        {
          "nome": "items",
          "tipo": "React.ReactNode[]",
          "padrao": "[]",
          "descricao": "An array of up to 3 items rendered as papers in the folder."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "—",
          "descricao": "Additional CSS classes for the folder container."
        }
      ],
      "totalProps": 4,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 125,
      "keywords": [
        "folder",
        "component",
        "color",
        "size",
        "items",
        "classname"
      ],
      "caminhoOrigem": "Components Animations\\Folder.txt"
    },
    {
      "id": "galaxy",
      "nome": "Galaxy",
      "arquivo": "Galaxy",
      "categoria": "background",
      "estilo": "particulas",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "focal",
          "tipo": "[number, number]",
          "padrao": "[0.5, 0.5]",
          "descricao": "Sets the focal point of the galaxy effect as [x, y] coordinates from 0 to 1"
        },
        {
          "nome": "rotation",
          "tipo": "[number, number]",
          "padrao": "[1.0, 0.0]",
          "descricao": "Controls the rotation matrix of the galaxy as [x, y] rotation values"
        },
        {
          "nome": "starSpeed",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Controls the speed of star movement and animation"
        },
        {
          "nome": "density",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Controls the density of stars in the galaxy"
        },
        {
          "nome": "hueShift",
          "tipo": "number",
          "padrao": "140",
          "descricao": "Shifts the hue of all stars by the specified degrees (0-360)"
        },
        {
          "nome": "disableAnimation",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "When true, stops all time-based animations"
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Global speed multiplier for all animations"
        },
        {
          "nome": "mouseInteraction",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enables or disables mouse interaction with the galaxy"
        },
        {
          "nome": "glowIntensity",
          "tipo": "number",
          "padrao": "0.3",
          "descricao": "Controls the intensity of the star glow effect"
        },
        {
          "nome": "saturation",
          "tipo": "number",
          "padrao": "0.0",
          "descricao": "Controls color saturation of stars (0 = grayscale, 1 = full color)"
        },
        {
          "nome": "mouseRepulsion",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "When true, stars are repelled by the mouse cursor"
        },
        {
          "nome": "twinkleIntensity",
          "tipo": "number",
          "padrao": "0.3",
          "descricao": "Controls how much stars twinkle (0 = no twinkle, 1 = maximum twinkle)"
        },
        {
          "nome": "rotationSpeed",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "Speed of automatic galaxy rotation"
        },
        {
          "nome": "repulsionStrength",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Strength of mouse repulsion effect when mouseRepulsion is enabled"
        },
        {
          "nome": "autoCenterRepulsion",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Creates repulsion from center of canvas. Overrides mouse repulsion when > 0"
        },
        {
          "nome": "transparent",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Makes the black background transparent, showing only stars"
        }
      ],
      "totalProps": 16,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 336,
      "keywords": [
        "galaxy",
        "background",
        "ogl",
        "focal",
        "rotation",
        "starspeed",
        "density",
        "hueshift",
        "disableanimation",
        "speed",
        "mouseinteraction",
        "glowintensity",
        "saturation",
        "mouserepulsion",
        "twinkleintensity"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Galaxy.txt"
    },
    {
      "id": "glare_hover",
      "nome": "GlareHover",
      "arquivo": "Glare Hover",
      "categoria": "component",
      "estilo": "cursor",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "width",
          "tipo": "string",
          "padrao": "500px",
          "descricao": "The width of the hover element."
        },
        {
          "nome": "height",
          "tipo": "string",
          "padrao": "500px",
          "descricao": "The height of the hover element."
        },
        {
          "nome": "background",
          "tipo": "string",
          "padrao": "#000",
          "descricao": "The background color of the element."
        },
        {
          "nome": "borderRadius",
          "tipo": "string",
          "padrao": "10px",
          "descricao": "The border radius of the element."
        },
        {
          "nome": "borderColor",
          "tipo": "string",
          "padrao": "#333",
          "descricao": "The border color of the element."
        },
        {
          "nome": "children",
          "tipo": "React.ReactNode",
          "padrao": "undefined",
          "descricao": "The content to display inside the glare hover element."
        },
        {
          "nome": "glareColor",
          "tipo": "string",
          "padrao": "#ffffff",
          "descricao": "The color of the glare effect (hex format)."
        },
        {
          "nome": "glareOpacity",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "The opacity of the glare effect (0-1)."
        },
        {
          "nome": "glareAngle",
          "tipo": "number",
          "padrao": "-45",
          "descricao": "The angle of the glare effect in degrees."
        },
        {
          "nome": "glareSize",
          "tipo": "number",
          "padrao": "250",
          "descricao": "The size of the glare effect as a percentage (e.g. 250 = 250%)."
        },
        {
          "nome": "transitionDuration",
          "tipo": "number",
          "padrao": "650",
          "descricao": "The duration of the transition in milliseconds."
        },
        {
          "nome": "playOnce",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "If true, the glare only animates on hover and doesn't return on mouse leave."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "\"\"",
          "descricao": "Additional CSS class names."
        },
        {
          "nome": "style",
          "tipo": "React.CSSProperties",
          "padrao": "{}",
          "descricao": "Additional inline styles."
        }
      ],
      "totalProps": 14,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 58,
      "keywords": [
        "glare",
        "hover",
        "component",
        "width",
        "height",
        "background",
        "borderradius",
        "bordercolor",
        "children",
        "glarecolor",
        "glareopacity",
        "glareangle",
        "glaresize",
        "transitionduration",
        "playonce"
      ],
      "caminhoOrigem": "Components Animations\\Glare Hover.txt"
    },
    {
      "id": "glass_icons",
      "nome": "GlassIcons",
      "arquivo": "Glass Icons",
      "categoria": "component",
      "estilo": "superficie",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "items",
          "tipo": "GlassIconsItem[]",
          "padrao": "[]",
          "descricao": "Array of items to render. Each item should include: an icon (React.ReactElement), a color (string), a label (string), and an optional customClass (string)."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "''",
          "descricao": "Optional additional CSS class(es) to be added to the container."
        }
      ],
      "totalProps": 2,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 40,
      "keywords": [
        "glass",
        "icons",
        "component",
        "items",
        "classname"
      ],
      "caminhoOrigem": "Components Animations\\Glass Icons.txt"
    },
    {
      "id": "glass_surface",
      "nome": "GlassSurface",
      "arquivo": "Glass Surface",
      "categoria": "component",
      "estilo": "superficie",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "children",
          "tipo": "React.ReactNode",
          "padrao": "undefined",
          "descricao": "Content to display inside the glass surface"
        },
        {
          "nome": "width",
          "tipo": "number",
          "padrao": "string",
          "descricao": "200"
        },
        {
          "nome": "height",
          "tipo": "number",
          "padrao": "string",
          "descricao": "80"
        },
        {
          "nome": "borderRadius",
          "tipo": "number",
          "padrao": "20",
          "descricao": "Border radius in pixels"
        },
        {
          "nome": "borderWidth",
          "tipo": "number",
          "padrao": "0.07",
          "descricao": "Border width factor for displacement map"
        },
        {
          "nome": "brightness",
          "tipo": "number",
          "padrao": "50",
          "descricao": "Brightness percentage for displacement map"
        },
        {
          "nome": "opacity",
          "tipo": "number",
          "padrao": "0.93",
          "descricao": "Opacity of displacement map elements"
        },
        {
          "nome": "blur",
          "tipo": "number",
          "padrao": "11",
          "descricao": "Input blur amount in pixels"
        },
        {
          "nome": "displace",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Output blur (stdDeviation)"
        },
        {
          "nome": "backgroundOpacity",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Background frost opacity (0-1)"
        },
        {
          "nome": "saturation",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Backdrop filter saturation factor"
        },
        {
          "nome": "distortionScale",
          "tipo": "number",
          "padrao": "-180",
          "descricao": "Main displacement scale"
        },
        {
          "nome": "redOffset",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Red channel extra displacement offset"
        },
        {
          "nome": "greenOffset",
          "tipo": "number",
          "padrao": "10",
          "descricao": "Green channel extra displacement offset"
        },
        {
          "nome": "blueOffset",
          "tipo": "number",
          "padrao": "20",
          "descricao": "Blue channel extra displacement offset"
        },
        {
          "nome": "xChannel",
          "tipo": "'R'",
          "padrao": "'G'",
          "descricao": "'B'"
        },
        {
          "nome": "yChannel",
          "tipo": "'R'",
          "padrao": "'G'",
          "descricao": "'B'"
        },
        {
          "nome": "mixBlendMode",
          "tipo": "BlendMode",
          "padrao": "'difference'",
          "descricao": "Mix blend mode for displacement map"
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "''",
          "descricao": "Additional CSS class names"
        },
        {
          "nome": "style",
          "tipo": "React.CSSProperties",
          "padrao": "{}",
          "descricao": "Inline styles object"
        }
      ],
      "totalProps": 20,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 235,
      "keywords": [
        "glass",
        "surface",
        "component",
        "children",
        "width",
        "height",
        "borderradius",
        "borderwidth",
        "brightness",
        "opacity",
        "blur",
        "displace",
        "backgroundopacity",
        "saturation",
        "distortionscale"
      ],
      "caminhoOrigem": "Components Animations\\Glass Surface.txt"
    },
    {
      "id": "gooey_nav",
      "nome": "GooeyNav",
      "arquivo": "Gooey Nav",
      "categoria": "component",
      "estilo": "navegacao",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "items",
          "tipo": "GooeyNavItem[]",
          "padrao": "[]",
          "descricao": "Array of navigation items."
        },
        {
          "nome": "animationTime",
          "tipo": "number",
          "padrao": "600",
          "descricao": "Duration (ms) of the main animation."
        },
        {
          "nome": "particleCount",
          "tipo": "number",
          "padrao": "15",
          "descricao": "Number of bubble particles per transition."
        },
        {
          "nome": "particleDistances",
          "tipo": "[number, number]",
          "padrao": "[90, 10]",
          "descricao": "Outer and inner distances of bubble spread."
        },
        {
          "nome": "particleR",
          "tipo": "number",
          "padrao": "100",
          "descricao": "Radius factor influencing random particle rotation."
        },
        {
          "nome": "timeVariance",
          "tipo": "number",
          "padrao": "300",
          "descricao": "Random time variance (ms) for particle animations."
        },
        {
          "nome": "colors",
          "tipo": "number[]",
          "padrao": "[1, 2, 3, 1, 2, 3, 1, 4]",
          "descricao": "Color indices used when creating bubble particles."
        },
        {
          "nome": "initialActiveIndex",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Which item is selected on mount."
        }
      ],
      "totalProps": 8,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 171,
      "keywords": [
        "gooey",
        "nav",
        "component",
        "items",
        "animationtime",
        "particlecount",
        "particledistances",
        "particler",
        "timevariance",
        "colors",
        "initialactiveindex"
      ],
      "caminhoOrigem": "Components Animations\\Gooey Nav.txt"
    },
    {
      "id": "gradient_blinds",
      "nome": "GradientBlinds",
      "arquivo": "Gradient Blinds",
      "categoria": "background",
      "estilo": "diverso",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "gradientColors",
          "tipo": "string[]",
          "padrao": "['#FF9FFC', '#5227FF']",
          "descricao": "Array of hex colors (up to 8) forming the animated gradient. If one color is provided it is duplicated."
        },
        {
          "nome": "angle",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Rotation of the gradient in degrees (0 = horizontal left→right)."
        },
        {
          "nome": "noise",
          "tipo": "number",
          "padrao": "0.3",
          "descricao": "Strength of per‑pixel noise added to the final color (0 = clean)."
        },
        {
          "nome": "blindCount",
          "tipo": "number",
          "padrao": "16",
          "descricao": "Target number of vertical blinds. Acts as an upper bound when blindMinWidth is set."
        },
        {
          "nome": "blindMinWidth",
          "tipo": "number",
          "padrao": "60",
          "descricao": "Minimum pixel width for each blind. Reduces effective blindCount if necessary to satisfy this width."
        },
        {
          "nome": "mouseDampening",
          "tipo": "number",
          "padrao": "0.15",
          "descricao": "Easing time constant (seconds) for the spotlight to follow the cursor. 0 = immediate."
        },
        {
          "nome": "mirrorGradient",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Creates a mirrored ping‑pong gradient progression instead of a linear wrap."
        },
        {
          "nome": "spotlightRadius",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Normalized spotlight radius relative to the shorter canvas dimension."
        },
        {
          "nome": "spotlightSoftness",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Falloff exponent for spotlight edge. Higher = sharper edge (values >1 increase contrast)."
        },
        {
          "nome": "spotlightOpacity",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Overall intensity multiplier for the spotlight highlight."
        },
        {
          "nome": "distortAmount",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Sin/cos warp intensity applied to UVs for subtle wavy distortion."
        },
        {
          "nome": "shineDirection",
          "tipo": "'left'",
          "padrao": "'right'",
          "descricao": "left"
        },
        {
          "nome": "mixBlendMode",
          "tipo": "string",
          "padrao": "'lighten'",
          "descricao": "CSS mix-blend-mode applied to the canvas (e.g. 'screen', 'overlay', 'multiply')."
        },
        {
          "nome": "paused",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "If true, stops rendering updates (freezing the current frame)."
        },
        {
          "nome": "dpr",
          "tipo": "number",
          "padrao": "window.devicePixelRatio",
          "descricao": "Overrides device pixel ratio; lower for performance, higher for sharpness."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "—",
          "descricao": "Additional class names for the root container."
        }
      ],
      "totalProps": 16,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 351,
      "keywords": [
        "gradient",
        "blinds",
        "background",
        "ogl",
        "gradientcolors",
        "angle",
        "noise",
        "blindcount",
        "blindminwidth",
        "mousedampening",
        "mirrorgradient",
        "spotlightradius",
        "spotlightsoftness",
        "spotlightopacity",
        "distortamount",
        "shinedirection"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Gradient Blinds.txt"
    },
    {
      "id": "grainient",
      "nome": "Grainient",
      "arquivo": "Grainient",
      "categoria": "background",
      "estilo": "diverso",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "color1",
          "tipo": "string",
          "padrao": "'#FF9FFC'",
          "descricao": "Primary light color used in the gradient blend."
        },
        {
          "nome": "color2",
          "tipo": "string",
          "padrao": "'#5227FF'",
          "descricao": "Secondary accent color used in the gradient blend."
        },
        {
          "nome": "color3",
          "tipo": "string",
          "padrao": "'#B497CF'",
          "descricao": "Deep base color used in the gradient blend."
        },
        {
          "nome": "timeSpeed",
          "tipo": "number",
          "padrao": "0.25",
          "descricao": "Animation speed multiplier for the gradient motion."
        },
        {
          "nome": "colorBalance",
          "tipo": "number",
          "padrao": "0.0",
          "descricao": "Shifts the palette balance toward dark or lighter tones."
        },
        {
          "nome": "warpStrength",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Strength of the wave warp distortion (0 = none)."
        },
        {
          "nome": "warpFrequency",
          "tipo": "number",
          "padrao": "5.0",
          "descricao": "Frequency of the wave warp."
        },
        {
          "nome": "warpSpeed",
          "tipo": "number",
          "padrao": "2.0",
          "descricao": "Speed multiplier for the warp animation."
        },
        {
          "nome": "warpAmplitude",
          "tipo": "number",
          "padrao": "50.0",
          "descricao": "Base amplitude for the warp distortion."
        },
        {
          "nome": "blendAngle",
          "tipo": "number",
          "padrao": "0.0",
          "descricao": "Rotation angle for the color blend axis (degrees)."
        },
        {
          "nome": "blendSoftness",
          "tipo": "number",
          "padrao": "0.05",
          "descricao": "Softens the blend edges between color layers."
        },
        {
          "nome": "rotationAmount",
          "tipo": "number",
          "padrao": "500.0",
          "descricao": "Rotation amount driven by noise."
        },
        {
          "nome": "noiseScale",
          "tipo": "number",
          "padrao": "2.0",
          "descricao": "Scales the noise frequency that drives rotation."
        },
        {
          "nome": "grainAmount",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "Amount of film grain applied to the gradient."
        },
        {
          "nome": "grainScale",
          "tipo": "number",
          "padrao": "2.0",
          "descricao": "Scale of the grain pattern."
        },
        {
          "nome": "grainAnimated",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Animate grain over time."
        },
        {
          "nome": "contrast",
          "tipo": "number",
          "padrao": "1.5",
          "descricao": "Overall contrast applied to the final color."
        },
        {
          "nome": "gamma",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Gamma correction for the final color."
        },
        {
          "nome": "saturation",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Saturation amount for the final color."
        },
        {
          "nome": "centerX",
          "tipo": "number",
          "padrao": "0.0",
          "descricao": "Horizontal offset of the gradient center."
        },
        {
          "nome": "centerY",
          "tipo": "number",
          "padrao": "0.0",
          "descricao": "Vertical offset of the gradient center."
        },
        {
          "nome": "zoom",
          "tipo": "number",
          "padrao": "0.9",
          "descricao": ""
        }
      ],
      "totalProps": 22,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 40,
      "keywords": [
        "grainient",
        "background",
        "ogl",
        "color1",
        "color2",
        "color3",
        "timespeed",
        "colorbalance",
        "warpstrength",
        "warpfrequency",
        "warpspeed",
        "warpamplitude",
        "blendangle",
        "blendsoftness",
        "rotationamount"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Grainient.txt"
    },
    {
      "id": "grid_distortion",
      "nome": "GridDistortion",
      "arquivo": "Grid Distortion",
      "categoria": "background",
      "estilo": "geometrico",
      "dependencias": [
        "three"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "imgageSrc",
          "tipo": "string",
          "padrao": "—",
          "descricao": "The image you want to render inside the container."
        },
        {
          "nome": "grid",
          "tipo": "number",
          "padrao": "15",
          "descricao": "The number of cells present in the distortion grid"
        },
        {
          "nome": "mouse",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "The size of the distortion effect that follows the cursor."
        },
        {
          "nome": "relaxation",
          "tipo": "number",
          "padrao": "0.9",
          "descricao": "The speed at which grid cells return to their initial state."
        },
        {
          "nome": "strength",
          "tipo": "number",
          "padrao": "0.15",
          "descricao": "The overall strength of the distortion effect."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "—",
          "descricao": "Any custom class(es) you want to apply to the container."
        }
      ],
      "totalProps": 6,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 265,
      "keywords": [
        "grid",
        "distortion",
        "background",
        "three",
        "imgagesrc",
        "mouse",
        "relaxation",
        "strength",
        "classname"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Grid Distortion.txt"
    },
    {
      "id": "grid_motion",
      "nome": "GridMotion",
      "arquivo": "Grid Motion",
      "categoria": "background",
      "estilo": "geometrico",
      "dependencias": [
        "gsap"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "items",
          "tipo": "array",
          "padrao": "[]",
          "descricao": "An array of items to display in the grid. Each item can be a string, JSX element, or an image URL."
        },
        {
          "nome": "gradientColor",
          "tipo": "string",
          "padrao": "black",
          "descricao": "Controls the color of the radial gradient used as the background."
        }
      ],
      "totalProps": 2,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 95,
      "keywords": [
        "grid",
        "motion",
        "background",
        "gsap",
        "items",
        "gradientcolor"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Grid Motion.txt"
    },
    {
      "id": "grid_scan",
      "nome": "GridScan",
      "arquivo": "Grid Scan",
      "categoria": "background",
      "estilo": "geometrico",
      "dependencias": [
        "three",
        "face-api.js"
      ],
      "dependenciasFaltando": [
        "face-api.js"
      ],
      "instalavel": false,
      "props": [
        {
          "nome": "enableWebcam",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Enable face tracking via webcam."
        },
        {
          "nome": "showPreview",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Show webcam preview/debug HUD."
        },
        {
          "nome": "modelsPath",
          "tipo": "string",
          "padrao": "CDN URL",
          "descricao": "Path/URL to face-api.js models."
        },
        {
          "nome": "sensitivity",
          "tipo": "number",
          "padrao": "0.55",
          "descricao": "Overall responsiveness to input."
        },
        {
          "nome": "lineThickness",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Grid line thickness."
        },
        {
          "nome": "linesColor",
          "tipo": "string",
          "padrao": "'#2F293A'",
          "descricao": "Color of the grid lines."
        },
        {
          "nome": "gridScale",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "Grid spacing scale (smaller = denser)."
        },
        {
          "nome": "lineStyle",
          "tipo": "'solid'",
          "padrao": "'dashed'",
          "descricao": "'dotted'"
        },
        {
          "nome": "lineJitter",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "Animated jitter along the grid lines."
        },
        {
          "nome": "enablePost",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enable post-processing effects."
        },
        {
          "nome": "bloomIntensity",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Bloom strength."
        },
        {
          "nome": "bloomThreshold",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Bloom luminance threshold."
        },
        {
          "nome": "bloomSmoothing",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Bloom threshold smoothing."
        },
        {
          "nome": "chromaticAberration",
          "tipo": "number",
          "padrao": "0.002",
          "descricao": "Chromatic aberration offset (post)."
        },
        {
          "nome": "noiseIntensity",
          "tipo": "number",
          "padrao": "0.01",
          "descricao": "Additive film grain intensity."
        },
        {
          "nome": "scanColor",
          "tipo": "string",
          "padrao": "'#FF9FFC'",
          "descricao": "Color of the scan beam/aura."
        },
        {
          "nome": "scanOpacity",
          "tipo": "number",
          "padrao": "0.4",
          "descricao": "Opacity of the scan effect."
        },
        {
          "nome": "scanDirection",
          "tipo": "'forward'",
          "padrao": "'backward'",
          "descricao": "'pingpong'"
        },
        {
          "nome": "scanSoftness",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Softness of scan band edges."
        },
        {
          "nome": "scanGlow",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Relative width/intensity of glow."
        },
        {
          "nome": "scanPhaseTaper",
          "tipo": "number",
          "padrao": "0.9",
          "descricao": "Fade-in/out window for the phase."
        },
        {
          "nome": "scanDuration",
          "tipo": "number",
          "padrao": "2.0",
          "descricao": "Duration of a scan cycle (seconds)."
        },
        {
          "nome": "scanDelay",
          "tipo": "number",
          "padrao": "2.0",
          "descricao": "Delay between scan cycles (seconds)."
        },
        {
          "nome": "enableGyro",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Use device orientation for input."
        },
        {
          "nome": "scanOnClick",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Trigger a scan when clicking."
        },
        {
          "nome": "snapBackDelay",
          "tipo": "number",
          "padrao": "250",
          "descricao": "Delay (ms) before input recenters."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "''",
          "descricao": "Additional CSS classes."
        },
        {
          "nome": "style",
          "tipo": "React.CSSProperties",
          "padrao": "{}",
          "descricao": "Inline style overrides."
        }
      ],
      "totalProps": 28,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 196,
      "keywords": [
        "grid",
        "scan",
        "background",
        "three",
        "face-api.js",
        "enablewebcam",
        "showpreview",
        "modelspath",
        "sensitivity",
        "linethickness",
        "linescolor",
        "gridscale",
        "linestyle",
        "linejitter",
        "enablepost",
        "bloomintensity",
        "bloomthreshold"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Grid Scan.txt"
    },
    {
      "id": "hyper_seed",
      "nome": "Hyperspeed",
      "arquivo": "Hyper Seed",
      "categoria": "background",
      "estilo": "diverso",
      "dependencias": [
        "three",
        "postprocessing"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "effectOptions",
          "tipo": "object",
          "padrao": "See the \"code\" tab for default values and presets.",
          "descricao": "The highly customizable configuration object for the effect, controls things like colors, distortion, line properties, etc."
        }
      ],
      "totalProps": 1,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 766,
      "keywords": [
        "hyperspeed",
        "hyper",
        "seed",
        "background",
        "three",
        "postprocessing",
        "effectoptions"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Hyper Seed.txt"
    },
    {
      "id": "image_trail_integrate_the_imagetrail_component_from_react_bits",
      "nome": "ImageTrail",
      "arquivo": "Image Trail ## Integrate the ImageTrail  component from React Bits",
      "categoria": "component",
      "estilo": "cursor",
      "dependencias": [
        "gsap"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [],
      "totalProps": 0,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 875,
      "keywords": [
        "image",
        "trail",
        "integrate",
        "the",
        "imagetrail",
        "component",
        "from",
        "react",
        "bits",
        "gsap"
      ],
      "caminhoOrigem": "Components Animations\\Image Trail ## Integrate the ImageTrail  component from React Bits.txt"
    },
    {
      "id": "infinite_menu",
      "nome": "InfiniteMenu",
      "arquivo": "Infinite Menu",
      "categoria": "component",
      "estilo": "navegacao",
      "dependencias": [
        "gl-matrix"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "items",
          "tipo": "object[]",
          "padrao": "[{...}]",
          "descricao": "List of items containing an image, link, title, and description - or just add what you need."
        },
        {
          "nome": "scale",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Controls camera zoom"
        }
      ],
      "totalProps": 2,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 858,
      "keywords": [
        "infinite",
        "menu",
        "component",
        "gl-matrix",
        "items",
        "scale"
      ],
      "caminhoOrigem": "Components Animations\\Infinite Menu.txt"
    },
    {
      "id": "lanyard",
      "nome": "Lanyard",
      "arquivo": "Lanyard",
      "categoria": "component",
      "estilo": "diverso",
      "dependencias": [
        "three",
        "meshline",
        "@react-three/fiber",
        "@react-three/drei",
        "@react-three/rapier"
      ],
      "dependenciasFaltando": [
        "@react-three/rapier"
      ],
      "instalavel": false,
      "props": [
        {
          "nome": "position",
          "tipo": "array",
          "padrao": "[0, 0, 30]",
          "descricao": "Initial camera position for the canvas."
        },
        {
          "nome": "gravity",
          "tipo": "array",
          "padrao": "[0, -40, 0]",
          "descricao": "Gravity vector for the physics simulation."
        },
        {
          "nome": "fov",
          "tipo": "number",
          "padrao": "20",
          "descricao": "Camera field of view."
        },
        {
          "nome": "transparent",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enables a transparent background for the canvas."
        },
        {
          "nome": "frontImage",
          "tipo": "string",
          "padrao": "null",
          "descricao": "Custom image URL for the card's front face. Falls back to the model's built-in texture when not set."
        },
        {
          "nome": "backImage",
          "tipo": "string",
          "padrao": "null",
          "descricao": "Custom image URL for the card's back face, rendered independently from the front."
        },
        {
          "nome": "imageFit",
          "tipo": "\"cover\"",
          "padrao": "\"contain\"",
          "descricao": "\"cover\""
        },
        {
          "nome": "lanyardImage",
          "tipo": "string",
          "padrao": "null",
          "descricao": "Custom image URL for the lanyard band's repeating texture. Falls back to the default band texture when not set."
        },
        {
          "nome": "lanyardWidth",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Width of the lanyard band (meshline lineWidth). Increase it to give a custom band image more room and reduce stretching."
        }
      ],
      "totalProps": 9,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 287,
      "keywords": [
        "lanyard",
        "component",
        "three",
        "meshline",
        "@react-three/fiber",
        "@react-three/drei",
        "@react-three/rapier",
        "position",
        "gravity",
        "fov",
        "transparent",
        "frontimage",
        "backimage",
        "imagefit",
        "lanyardimage",
        "lanyardwidth"
      ],
      "caminhoOrigem": "Components Animations\\Lanyard.txt"
    },
    {
      "id": "laser_flow_gradiente_cursor",
      "nome": "LaserFlow",
      "arquivo": "Laser Flow ( Gradiente cursor )",
      "categoria": "component",
      "estilo": "luz",
      "dependencias": [
        "three"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "horizontalBeamOffset",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "Horizontal offset of the beam (0–1 of canvas width)."
        },
        {
          "nome": "verticalBeamOffset",
          "tipo": "number",
          "padrao": "0.0",
          "descricao": "Vertical offset of the beam (0–1 of canvas height)."
        },
        {
          "nome": "horizontalSizing",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Horizontal sizing factor of the beam footprint."
        },
        {
          "nome": "verticalSizing",
          "tipo": "number",
          "padrao": "2.0",
          "descricao": "Vertical sizing factor of the beam footprint."
        },
        {
          "nome": "wispDensity",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Density of micro-streak wisps."
        },
        {
          "nome": "wispSpeed",
          "tipo": "number",
          "padrao": "15.0",
          "descricao": "Speed of wisp motion."
        },
        {
          "nome": "wispIntensity",
          "tipo": "number",
          "padrao": "5.0",
          "descricao": "Brightness of wisps."
        },
        {
          "nome": "flowSpeed",
          "tipo": "number",
          "padrao": "0.35",
          "descricao": "Speed of the beam’s flow modulation."
        },
        {
          "nome": "flowStrength",
          "tipo": "number",
          "padrao": "0.25",
          "descricao": "Strength of the beam’s flow modulation."
        },
        {
          "nome": "fogIntensity",
          "tipo": "number",
          "padrao": "0.45",
          "descricao": "Overall volumetric fog intensity."
        },
        {
          "nome": "fogScale",
          "tipo": "number",
          "padrao": "0.3",
          "descricao": "Spatial scale for the fog noise."
        },
        {
          "nome": "fogFallSpeed",
          "tipo": "number",
          "padrao": "0.6",
          "descricao": "Drift speed for the fog field."
        },
        {
          "nome": "mouseTiltStrength",
          "tipo": "number",
          "padrao": "0.01",
          "descricao": "How much mouse x tilts the fog volume."
        },
        {
          "nome": "mouseSmoothTime",
          "tipo": "number",
          "padrao": "0.0",
          "descricao": "Pointer smoothing time (seconds)."
        },
        {
          "nome": "decay",
          "tipo": "number",
          "padrao": "1.1",
          "descricao": "Beam decay shaping for sampling envelope."
        },
        {
          "nome": "falloffStart",
          "tipo": "number",
          "padrao": "1.2",
          "descricao": "Falloff start radius used in inverse-square blending."
        },
        {
          "nome": "dpr",
          "tipo": "number",
          "padrao": "auto",
          "descricao": "Device pixel ratio override (defaults to window.devicePixelRatio)."
        },
        {
          "nome": "color",
          "tipo": "string",
          "padrao": "#FF79C6",
          "descricao": "Beam color (hex)."
        }
      ],
      "totalProps": 18,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 83,
      "keywords": [
        "laser",
        "flow",
        "gradiente",
        "cursor",
        "component",
        "three",
        "horizontalbeamoffset",
        "verticalbeamoffset",
        "horizontalsizing",
        "verticalsizing",
        "wispdensity",
        "wispspeed",
        "wispintensity",
        "flowspeed",
        "flowstrength",
        "fogintensity",
        "fogscale",
        "fogfallspeed"
      ],
      "caminhoOrigem": "Components Animations\\Laser Flow ( Gradiente cursor ).txt"
    },
    {
      "id": "letter_glitch",
      "nome": "LetterGlitch",
      "arquivo": "Letter Glitch",
      "categoria": "background",
      "estilo": "glitch",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "glitchColors",
          "tipo": "string[]",
          "padrao": "['#2b4539', '#61dca3', '#61b3dc']",
          "descricao": "Controls the colors of the letters rendered in the canvas."
        },
        {
          "nome": "glitchSpeed",
          "tipo": "number",
          "padrao": "50",
          "descricao": "Controls the speed at which letters scramble in the animation."
        },
        {
          "nome": "centerVignette",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "When true, renders a radial gradient in the center of the container"
        },
        {
          "nome": "outerVignette",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "When true, renders an inner radial gradient around the edges of the container."
        },
        {
          "nome": "smooth",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "When true, smoothens the animation of the letters for a more subtle feel."
        },
        {
          "nome": "characters",
          "tipo": "string",
          "padrao": "ABCDEFGHIJKLMNOPQRSTUVWXY",
          "descricao": ""
        }
      ],
      "totalProps": 6,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 11,
      "keywords": [
        "letter",
        "glitch",
        "background",
        "glitchcolors",
        "glitchspeed",
        "centervignette",
        "outervignette",
        "smooth",
        "characters"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Letter Glitch.txt"
    },
    {
      "id": "light_pillar",
      "nome": "LightPillar",
      "arquivo": "Light Pillar",
      "categoria": "background",
      "estilo": "luz",
      "dependencias": [
        "three"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "topColor",
          "tipo": "string",
          "padrao": "'#5227FF'",
          "descricao": "Hex color string for the top gradient color of the light pillar."
        },
        {
          "nome": "bottomColor",
          "tipo": "string",
          "padrao": "'#FF9FFC'",
          "descricao": "Hex color string for the bottom gradient color of the light pillar."
        },
        {
          "nome": "intensity",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Controls the overall brightness and intensity of the effect."
        },
        {
          "nome": "rotationSpeed",
          "tipo": "number",
          "padrao": "0.3",
          "descricao": "Speed multiplier for the pillar rotation animation."
        },
        {
          "nome": "interactive",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Enable mouse interaction to control the pillar rotation."
        },
        {
          "nome": "glowAmount",
          "tipo": "number",
          "padrao": "0.005",
          "descricao": "Controls the glow intensity and spread of the light effect."
        },
        {
          "nome": "pillarWidth",
          "tipo": "number",
          "padrao": "3.0",
          "descricao": "Width/radius of the light pillar."
        },
        {
          "nome": "pillarHeight",
          "tipo": "number",
          "padrao": "0.4",
          "descricao": "Height scaling factor for the pillar distortion."
        },
        {
          "nome": "noiseIntensity",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Intensity of the film grain noise postprocessing effect."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "''",
          "descricao": "Additional CSS class names to apply to the container element."
        },
        {
          "nome": "mixBlendMode",
          "tipo": "string",
          "padrao": "'screen'",
          "descricao": "CSS mix-blend-mode property to control how the component blends with its background."
        },
        {
          "nome": "pillarRotation",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Rotation angle of the pillar in degrees (0-360)."
        },
        {
          "nome": "quality",
          "tipo": "'low'",
          "padrao": "'medium'",
          "descricao": "'high'"
        }
      ],
      "totalProps": 13,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 383,
      "keywords": [
        "light",
        "pillar",
        "background",
        "three",
        "topcolor",
        "bottomcolor",
        "intensity",
        "rotationspeed",
        "interactive",
        "glowamount",
        "pillarwidth",
        "pillarheight",
        "noiseintensity",
        "classname",
        "mixblendmode",
        "pillarrotation"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Light Pillar.txt"
    },
    {
      "id": "light_rays",
      "nome": "LightRays",
      "arquivo": "Light Rays",
      "categoria": "background",
      "estilo": "luz",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "raysOrigin",
          "tipo": "RaysOrigin",
          "padrao": "\"top-center\"",
          "descricao": "Origin position of the light rays. Options: 'top-center', 'top-left', 'top-right', 'right', 'left', 'bottom-center', 'bottom-right', 'bottom-left'"
        },
        {
          "nome": "raysColor",
          "tipo": "string",
          "padrao": "\"#ffffff\"",
          "descricao": "Color of the light rays in hex format"
        },
        {
          "nome": "raysSpeed",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Animation speed of the rays"
        },
        {
          "nome": "lightSpread",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "How wide the light rays spread. Lower values = tighter rays, higher values = wider spread"
        },
        {
          "nome": "rayLength",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Maximum length/reach of the rays"
        },
        {
          "nome": "pulsating",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Enable pulsing animation effect"
        },
        {
          "nome": "fadeDistance",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "How far rays fade out from origin"
        },
        {
          "nome": "saturation",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Color saturation level (0-1)"
        },
        {
          "nome": "followMouse",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Make rays rotate towards the mouse cursor"
        },
        {
          "nome": "mouseInfluence",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "How much mouse affects rays (0-1)"
        },
        {
          "nome": "noiseAmount",
          "tipo": "number",
          "padrao": "0.0",
          "descricao": "Add noise/grain to rays (0-1)"
        },
        {
          "nome": "distortion",
          "tipo": "number",
          "padrao": "0.0",
          "descricao": "Apply wave distortion to rays"
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "\"\"",
          "descricao": "Additional CSS classes to apply to the container"
        }
      ],
      "totalProps": 13,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 402,
      "keywords": [
        "light",
        "rays",
        "background",
        "ogl",
        "raysorigin",
        "rayscolor",
        "raysspeed",
        "lightspread",
        "raylength",
        "pulsating",
        "fadedistance",
        "saturation",
        "followmouse",
        "mouseinfluence",
        "noiseamount",
        "distortion"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Light Rays.txt"
    },
    {
      "id": "lightfail",
      "nome": "Lightfall",
      "arquivo": "Lightfail",
      "categoria": "background",
      "estilo": "luz",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "colors",
          "tipo": "string[]",
          "padrao": "['#A6C8FF', '#5227FF', '#FF9FFC']",
          "descricao": "Array of hex colors (up to 8) used to tint the falling light streaks. Each streak is randomly but evenly assigned one of the colors; a single color makes the whole effect uniform."
        },
        {
          "nome": "backgroundColor",
          "tipo": "string",
          "padrao": "'#0A29FF'",
          "descricao": "Hex color of the soft ambient glow behind the streaks."
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Multiplier for how fast the light streaks fall."
        },
        {
          "nome": "streakCount",
          "tipo": "number",
          "padrao": "8",
          "descricao": "Number of streak layers rendered per cell (1–16). Higher = busier."
        },
        {
          "nome": "streakWidth",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Thickness of each light streak."
        },
        {
          "nome": "streakLength",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Length of the glowing tail trailing each streak."
        },
        {
          "nome": "glow",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Overall brightness multiplier applied before tone mapping."
        },
        {
          "nome": "density",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Vertical frequency of streaks. Higher values pack more streaks into view."
        },
        {
          "nome": "twinkle",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Amount of per‑streak brightness flicker. 0 = constant brightness."
        },
        {
          "nome": "zoom",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Field of view into the tunnel. Higher values zoom further in."
        },
        {
          "nome": "backgroundGlow",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Intensity of the ambient background glow."
        },
        {
          "nome": "opacity",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Overall alpha of the rendered canvas."
        },
        {
          "nome": "mouseInteraction",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enables a soft light that follows the cursor and flares nearby streaks (no warping)."
        },
        {
          "nome": "mouseStrength",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Intensity of the cursor light."
        },
        {
          "nome": "mouseRadius",
          "tipo": "number",
          "padrao": "0.6",
          "descricao": "Falloff radius of the cursor light."
        },
        {
          "nome": "mouseDampening",
          "tipo": "number",
          "padrao": "0.15",
          "descricao": "Easing time constant (seconds) for the cursor light to follow the pointer. 0 = immediate."
        },
        {
          "nome": "mixBlendMode",
          "tipo": "string",
          "padrao": "undefined",
          "descricao": "CSS mix-blend-mode applied to the canvas (e.g. 'screen', 'lighten')."
        },
        {
          "nome": "paused",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "If true, stops rendering updates (freezing the current frame)."
        },
        {
          "nome": "dpr",
          "tipo": "number",
          "padrao": "window.devicePixelRatio",
          "descricao": "Overrides device pixel ratio; lower for performance, higher for sharpness."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "—",
          "descricao": "Additional class names for the root container."
        }
      ],
      "totalProps": 20,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 69,
      "keywords": [
        "lightfall",
        "lightfail",
        "background",
        "ogl",
        "colors",
        "backgroundcolor",
        "speed",
        "streakcount",
        "streakwidth",
        "streaklength",
        "glow",
        "density",
        "twinkle",
        "zoom",
        "backgroundglow",
        "opacity"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Lightfail.txt"
    },
    {
      "id": "lighthing_storm",
      "nome": "Lightning",
      "arquivo": "lighthing storm",
      "categoria": "background",
      "estilo": "luz",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [],
      "totalProps": 0,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 185,
      "keywords": [
        "lightning",
        "lighthing",
        "storm",
        "background"
      ],
      "caminhoOrigem": "Backgrounds Animations\\lighthing storm.txt"
    },
    {
      "id": "line_sidebar",
      "nome": "LineSidebar",
      "arquivo": "Line SideBar",
      "categoria": "component",
      "estilo": "navegacao",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "items",
          "tipo": "string[]",
          "padrao": "[...]",
          "descricao": "Labels rendered as the list of sidebar entries."
        },
        {
          "nome": "accentColor",
          "tipo": "string",
          "padrao": "\"#A855F7\"",
          "descricao": "Color items and markers shift toward as the cursor gets close."
        },
        {
          "nome": "textColor",
          "tipo": "string",
          "padrao": "\"#c4c4c4\"",
          "descricao": "Resting color of the item labels."
        },
        {
          "nome": "markerColor",
          "tipo": "string",
          "padrao": "\"#6c6c6c\"",
          "descricao": "Resting color of the leading marker lines."
        },
        {
          "nome": "showIndex",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Show the zero-padded index before each label."
        },
        {
          "nome": "showMarker",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Show the marker lines (and short ticks) beside each item."
        },
        {
          "nome": "proximityRadius",
          "tipo": "number",
          "padrao": "100",
          "descricao": "Vertical distance in pixels within which the cursor influences an item."
        },
        {
          "nome": "maxShift",
          "tipo": "number",
          "padrao": "30",
          "descricao": "Maximum horizontal shift in pixels the label slides at full proximity."
        },
        {
          "nome": "falloff",
          "tipo": "\"linear\"",
          "padrao": "\"smooth\"",
          "descricao": "\"sharp\""
        },
        {
          "nome": "markerLength",
          "tipo": "number",
          "padrao": "60",
          "descricao": "Length in pixels of the marker line; the in-between ticks scale from this too."
        },
        {
          "nome": "markerGap",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Gap in pixels between the labels and the markers."
        },
        {
          "nome": "tickScale",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Length of the in-between ticks as a fraction of markerLength."
        },
        {
          "nome": "scaleTick",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "When true, the in-between ticks also grow with cursor proximity."
        },
        {
          "nome": "itemGap",
          "tipo": "number",
          "padrao": "20",
          "descricao": "Vertical gap between items in pixels."
        },
        {
          "nome": "fontSize",
          "tipo": "number",
          "padrao": "1.1",
          "descricao": "Font size of the labels in rem."
        },
        {
          "nome": "smoothing",
          "tipo": "number",
          "padrao": "100",
          "descricao": "Transition duration in milliseconds for the proximity response."
        },
        {
          "nome": "defaultActive",
          "tipo": "number",
          "padrao": "null",
          "descricao": "null"
        },
        {
          "nome": "onItemClick",
          "tipo": "(index, label) => void",
          "padrao": "-",
          "descricao": "Called when an item is clicked; the clicked item also becomes active."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "\"\"",
          "descricao": "Additional CSS classes for the outer wrapper."
        }
      ],
      "totalProps": 19,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 178,
      "keywords": [
        "line",
        "sidebar",
        "component",
        "items",
        "accentcolor",
        "textcolor",
        "markercolor",
        "showindex",
        "showmarker",
        "proximityradius",
        "maxshift",
        "falloff",
        "markerlength",
        "markergap",
        "tickscale"
      ],
      "caminhoOrigem": "Components Animations\\Line SideBar.txt"
    },
    {
      "id": "line_waves",
      "nome": "LineWaves",
      "arquivo": "Line Waves",
      "categoria": "background",
      "estilo": "fluido",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "0.3",
          "descricao": "Overall animation speed multiplier."
        },
        {
          "nome": "innerLineCount",
          "tipo": "number",
          "padrao": "32.0",
          "descricao": "Number of lines in the inner (center) wave region."
        },
        {
          "nome": "outerLineCount",
          "tipo": "number",
          "padrao": "36.0",
          "descricao": "Number of lines in the outer (edge) wave region."
        },
        {
          "nome": "warpIntensity",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Intensity of the wave distortion effect."
        },
        {
          "nome": "rotation",
          "tipo": "number",
          "padrao": "-45",
          "descricao": "Rotation of the wave pattern in degrees."
        },
        {
          "nome": "edgeFadeWidth",
          "tipo": "number",
          "padrao": "0.0",
          "descricao": "Width of the edge fade between inner and outer regions."
        },
        {
          "nome": "colorCycleSpeed",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Speed of color cycling animation."
        },
        {
          "nome": "brightness",
          "tipo": "number",
          "padrao": "0.2",
          "descricao": "Overall brightness multiplier."
        },
        {
          "nome": "color1",
          "tipo": "string",
          "padrao": "\"#ffffff\"",
          "descricao": "First color channel in HEX format."
        },
        {
          "nome": "color2",
          "tipo": "string",
          "padrao": "\"#ffffff\"",
          "descricao": "Second color channel in HEX format."
        },
        {
          "nome": "color3",
          "tipo": "string",
          "padrao": "\"#ffffff\"",
          "descricao": "Third color channel in HEX format."
        },
        {
          "nome": "enableMouseInteraction",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enable cursor-reactive wave distortion."
        },
        {
          "nome": "mouseInfluence",
          "tipo": "number",
          "padrao": "2.0",
          "descricao": "Strength of mouse influence on the wave pattern."
        }
      ],
      "totalProps": 13,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 252,
      "keywords": [
        "line",
        "waves",
        "background",
        "ogl",
        "speed",
        "innerlinecount",
        "outerlinecount",
        "warpintensity",
        "rotation",
        "edgefadewidth",
        "colorcyclespeed",
        "brightness",
        "color1",
        "color2",
        "color3",
        "enablemouseinteraction"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Line Waves.txt"
    },
    {
      "id": "liquid_chrome",
      "nome": "LiquidChrome",
      "arquivo": "Liquid Chrome",
      "categoria": "background",
      "estilo": "fluido",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "baseColor",
          "tipo": "RGB array (number[3])",
          "padrao": "[0.1, 0.1, 0.1]",
          "descricao": "Base color of the component. Specify as an RGB array."
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Animation speed multiplier."
        },
        {
          "nome": "amplitude",
          "tipo": "number",
          "padrao": "0.6",
          "descricao": "Amplitude of the distortion."
        },
        {
          "nome": "frequencyX",
          "tipo": "number",
          "padrao": "2.5",
          "descricao": "Frequency modifier for the x distortion."
        },
        {
          "nome": "frequencyY",
          "tipo": "number",
          "padrao": "1.5",
          "descricao": "Frequency modifier for the y distortion."
        },
        {
          "nome": "interactive",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enable mouse/touch interaction."
        }
      ],
      "totalProps": 6,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 164,
      "keywords": [
        "liquid",
        "chrome",
        "background",
        "ogl",
        "basecolor",
        "speed",
        "amplitude",
        "frequencyx",
        "frequencyy",
        "interactive"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Liquid Chrome.txt"
    },
    {
      "id": "liquid_ether",
      "nome": "LiquidEther",
      "arquivo": "Liquid Ether",
      "categoria": "background",
      "estilo": "fluido",
      "dependencias": [
        "three"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "colors",
          "tipo": "string[]",
          "padrao": "[\"#5227FF\", \"#FF9FFC\", \"#B497CF\"]",
          "descricao": "Array of hex color stops used to build the velocity-to-color palette."
        },
        {
          "nome": "mouseForce",
          "tipo": "number",
          "padrao": "20",
          "descricao": "Strength multiplier applied to mouse / touch movement when injecting velocity."
        },
        {
          "nome": "cursorSize",
          "tipo": "number",
          "padrao": "100",
          "descricao": "Radius (in pixels at base resolution) of the force brush."
        },
        {
          "nome": "resolution",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Simulation texture scale relative to canvas size (lower = better performance, more blur)."
        },
        {
          "nome": "dt",
          "tipo": "number",
          "padrao": "0.014",
          "descricao": "Fixed simulation timestep used inside the advection / diffusion passes."
        },
        {
          "nome": "BFECC",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enable BFECC advection (error-compensated) for crisper flow; disable for slight performance gain."
        },
        {
          "nome": "isViscous",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Toggle iterative viscosity solve (smoother, thicker motion when enabled)."
        },
        {
          "nome": "viscous",
          "tipo": "number",
          "padrao": "30",
          "descricao": "Viscosity coefficient used when isViscous is true."
        },
        {
          "nome": "iterationsViscous",
          "tipo": "number",
          "padrao": "32",
          "descricao": "Number of Gauss-Seidel iterations for viscosity (higher = smoother, slower)."
        },
        {
          "nome": "iterationsPoisson",
          "tipo": "number",
          "padrao": "32",
          "descricao": "Number of pressure Poisson iterations to enforce incompressibility."
        },
        {
          "nome": "isBounce",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "If true, shows bounce boundaries (velocity clamped at edges)."
        },
        {
          "nome": "autoDemo",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enable idle auto-driving of the pointer when no user interaction."
        },
        {
          "nome": "autoSpeed",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Speed (normalized units/sec) for auto pointer motion."
        },
        {
          "nome": "autoIntensity",
          "tipo": "number",
          "padrao": "2.2",
          "descricao": "Multiplier applied to velocity delta while in auto mode."
        },
        {
          "nome": "takeoverDuration",
          "tipo": "number",
          "padrao": "0.25",
          "descricao": "Seconds to interpolate from auto pointer to real cursor when user moves mouse."
        },
        {
          "nome": "autoResumeDelay",
          "tipo": "number",
          "padrao": "1000",
          "descricao": "Milliseconds of inactivity before auto mode resumes."
        },
        {
          "nome": "autoRampDuration",
          "tipo": "number",
          "padrao": "0.6",
          "descricao": "Seconds to ramp auto movement speed from 0 to full after activation."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "''",
          "descricao": "Optional class for the root container."
        },
        {
          "nome": "style",
          "tipo": "React.CSSProperties",
          "padrao": "{}",
          "descricao": "Inline styles applied to the root container."
        }
      ],
      "totalProps": 19,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 1171,
      "keywords": [
        "liquid",
        "ether",
        "background",
        "three",
        "colors",
        "mouseforce",
        "cursorsize",
        "resolution",
        "bfecc",
        "isviscous",
        "viscous",
        "iterationsviscous",
        "iterationspoisson",
        "isbounce",
        "autodemo"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Liquid Ether.txt"
    },
    {
      "id": "logo_loops_bar",
      "nome": "LogoLoop",
      "arquivo": "Logo Loops Bar",
      "categoria": "component",
      "estilo": "diverso",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "logos",
          "tipo": "LogoItem[]",
          "padrao": "required",
          "descricao": "Array of logo items to display. Each item can be either a React node or an image src."
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "120",
          "descricao": "Animation speed in pixels per second. Positive values move based on direction, negative values reverse direction."
        },
        {
          "nome": "direction",
          "tipo": "'left'",
          "padrao": "'right'",
          "descricao": "'up'"
        },
        {
          "nome": "width",
          "tipo": "number",
          "padrao": "string",
          "descricao": "'100%'"
        },
        {
          "nome": "logoHeight",
          "tipo": "number",
          "padrao": "28",
          "descricao": "Height of the logos in pixels."
        },
        {
          "nome": "gap",
          "tipo": "number",
          "padrao": "32",
          "descricao": "Gap between logos in pixels."
        },
        {
          "nome": "hoverSpeed",
          "tipo": "number",
          "padrao": "undefined",
          "descricao": "0"
        },
        {
          "nome": "fadeOut",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Whether to apply fade-out effect at the edges of the container."
        },
        {
          "nome": "fadeOutColor",
          "tipo": "string",
          "padrao": "undefined",
          "descricao": "Color used for the fade-out effect. Only applies when fadeOut is true."
        },
        {
          "nome": "scaleOnHover",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Whether to scale logos on hover."
        },
        {
          "nome": "renderItem",
          "tipo": "(item: LogoItem, key: React.Key) => React.ReactNode",
          "padrao": "undefined",
          "descricao": "Custom render function for each logo item. Allows full control over item rendering for animations, tooltips, etc."
        },
        {
          "nome": "ariaLabel",
          "tipo": "string",
          "padrao": "'Partner logos'",
          "descricao": "Accessibility label for the logo loop component."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "undefined",
          "descricao": "Additional CSS class names to apply to the root element."
        },
        {
          "nome": "style",
          "tipo": "React.CSSProperties",
          "padrao": "undefined",
          "descricao": "Inline styles to apply to the root element."
        }
      ],
      "totalProps": 14,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 322,
      "keywords": [
        "logo",
        "loop",
        "loops",
        "bar",
        "component",
        "logos",
        "speed",
        "direction",
        "width",
        "logoheight",
        "gap",
        "hoverspeed",
        "fadeout",
        "fadeoutcolor",
        "scaleonhover",
        "renderitem",
        "arialabel"
      ],
      "caminhoOrigem": "Components Animations\\Logo Loops Bar.txt"
    },
    {
      "id": "magic_bento",
      "nome": "MagicBento",
      "arquivo": "Magic Bento",
      "categoria": "component",
      "estilo": "diverso",
      "dependencias": [
        "gsap"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "textAutoHide",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Whether text content should auto-hide on hover"
        },
        {
          "nome": "enableStars",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enable particle star animation effect"
        },
        {
          "nome": "enableSpotlight",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enable spotlight cursor following effect"
        },
        {
          "nome": "enableBorderGlow",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enable border glow effect that follows cursor"
        },
        {
          "nome": "disableAnimations",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Disable all animations (automatically enabled on mobile)"
        },
        {
          "nome": "spotlightRadius",
          "tipo": "number",
          "padrao": "300",
          "descricao": "Radius of the spotlight effect in pixels"
        },
        {
          "nome": "particleCount",
          "tipo": "number",
          "padrao": "12",
          "descricao": "Number of particles in the star animation"
        },
        {
          "nome": "enableTilt",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Enable 3D tilt effect on card hover"
        },
        {
          "nome": "glowColor",
          "tipo": "string",
          "padrao": "\"132, 0, 255\"",
          "descricao": "RGB color values for glow effects (without rgba wrapper)"
        },
        {
          "nome": "clickEffect",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enable ripple effect on card click"
        },
        {
          "nome": "enableMagnetism",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enable subtle card attraction to cursor"
        }
      ],
      "totalProps": 11,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 666,
      "keywords": [
        "magic",
        "bento",
        "component",
        "gsap",
        "textautohide",
        "enablestars",
        "enablespotlight",
        "enableborderglow",
        "disableanimations",
        "spotlightradius",
        "particlecount",
        "enabletilt",
        "glowcolor",
        "clickeffect",
        "enablemagnetism"
      ],
      "caminhoOrigem": "Components Animations\\Magic Bento.txt"
    },
    {
      "id": "magic_rings",
      "nome": "MagicRings",
      "arquivo": "Magic Rings",
      "categoria": "component",
      "estilo": "diverso",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "color",
          "tipo": "string",
          "padrao": "\"#A855F7\"",
          "descricao": "Hex color for the rings."
        },
        {
          "nome": "colorTwo",
          "tipo": "string",
          "padrao": "\"#6366F1\"",
          "descricao": "Second color — rings interpolate from color to colorTwo."
        },
        {
          "nome": "ringCount",
          "tipo": "number",
          "padrao": "6",
          "descricao": "Number of concentric rings to draw (1–10)."
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Animation speed multiplier."
        },
        {
          "nome": "attenuation",
          "tipo": "number",
          "padrao": "10",
          "descricao": "Glow falloff — higher values produce tighter glow."
        },
        {
          "nome": "lineThickness",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Thickness of each ring line."
        },
        {
          "nome": "baseRadius",
          "tipo": "number",
          "padrao": "0.35",
          "descricao": "Radius of the innermost ring (normalized)."
        },
        {
          "nome": "radiusStep",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "Spacing between successive rings."
        },
        {
          "nome": "scaleRate",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "How much rings expand over time."
        },
        {
          "nome": "opacity",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Overall opacity of the effect (0–1)."
        },
        {
          "nome": "blur",
          "tipo": "number",
          "padrao": "0",
          "descricao": "CSS blur in px — creates a bloom/glow effect."
        },
        {
          "nome": "noiseAmount",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "Film-grain noise intensity."
        },
        {
          "nome": "rotation",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Static rotation of the pattern in degrees."
        },
        {
          "nome": "ringGap",
          "tipo": "number",
          "padrao": "1.5",
          "descricao": "Exponential base for angular cutaway per ring."
        },
        {
          "nome": "fadeIn",
          "tipo": "number",
          "padrao": "0.7",
          "descricao": "Duration of ring fade-in within cycle."
        },
        {
          "nome": "fadeOut",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Start time of ring fade-out within cycle."
        },
        {
          "nome": "followMouse",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Rings shift toward the mouse cursor."
        },
        {
          "nome": "mouseInfluence",
          "tipo": "number",
          "padrao": "0.2",
          "descricao": "Strength of mouse follow (when followMouse is true)."
        },
        {
          "nome": "hoverScale",
          "tipo": "number",
          "padrao": "1.2",
          "descricao": "Scale multiplier on hover."
        },
        {
          "nome": "parallax",
          "tipo": "number",
          "padrao": "0.05",
          "descricao": "Per-ring depth offset based on mouse position."
        },
        {
          "nome": "clickBurst",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Click triggers a brightness flash and scale pulse."
        }
      ],
      "totalProps": 21,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 243,
      "keywords": [
        "magic",
        "rings",
        "component",
        "color",
        "colortwo",
        "ringcount",
        "speed",
        "attenuation",
        "linethickness",
        "baseradius",
        "radiusstep",
        "scalerate",
        "opacity",
        "blur",
        "noiseamount"
      ],
      "caminhoOrigem": "Components Animations\\Magic Rings.txt"
    },
    {
      "id": "magnet_lines",
      "nome": "MagnetLines",
      "arquivo": "Magnet Lines",
      "categoria": "component",
      "estilo": "cursor",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "rows",
          "tipo": "number",
          "padrao": "9",
          "descricao": "Number of grid rows."
        },
        {
          "nome": "columns",
          "tipo": "number",
          "padrao": "9",
          "descricao": "Number of grid columns."
        },
        {
          "nome": "containerSize",
          "tipo": "string",
          "padrao": "80vmin",
          "descricao": "Specifies the width and height of the entire grid container."
        },
        {
          "nome": "lineColor",
          "tipo": "string",
          "padrao": "#efefef",
          "descricao": "Color for each line (the <span> elements)."
        },
        {
          "nome": "lineWidth",
          "tipo": "string",
          "padrao": "1vmin",
          "descricao": "Specifies each line’s thickness."
        },
        {
          "nome": "lineHeight",
          "tipo": "string",
          "padrao": "6vmin",
          "descricao": "Specifies each line’s length."
        },
        {
          "nome": "baseAngle",
          "tipo": "number",
          "padrao": "-10",
          "descricao": "Initial rotation angle (in degrees) before pointer movement."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "—",
          "descricao": "Additional class name(s) applied to the container."
        },
        {
          "nome": "style",
          "tipo": "object",
          "padrao": "{}",
          "descricao": "Inline styles for the container."
        }
      ],
      "totalProps": 9,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 83,
      "keywords": [
        "magnet",
        "lines",
        "component",
        "rows",
        "columns",
        "containersize",
        "linecolor",
        "linewidth",
        "lineheight",
        "baseangle",
        "classname",
        "style"
      ],
      "caminhoOrigem": "Components Animations\\Magnet Lines.txt"
    },
    {
      "id": "mansory",
      "nome": "Masonry",
      "arquivo": "Mansory",
      "categoria": "component",
      "estilo": "geometrico",
      "dependencias": [
        "gsap"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "items",
          "tipo": "array",
          "padrao": "required",
          "descricao": "Array of items to display in the masonry layout. Each item should have id, img, url, and height properties."
        },
        {
          "nome": "ease",
          "tipo": "string",
          "padrao": "\"power3.out\"",
          "descricao": "GSAP easing function for animations."
        },
        {
          "nome": "duration",
          "tipo": "number",
          "padrao": "0.6",
          "descricao": "Duration of the transition animations in seconds."
        },
        {
          "nome": "stagger",
          "tipo": "number",
          "padrao": "0.05",
          "descricao": "Delay between each item's animation in seconds."
        },
        {
          "nome": "animateFrom",
          "tipo": "string",
          "padrao": "\"bottom\"",
          "descricao": "Direction from which items animate in. Options: 'top', 'bottom', 'left', 'right', 'center', 'random'."
        },
        {
          "nome": "scaleOnHover",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Whether items should scale on hover."
        },
        {
          "nome": "hoverScale",
          "tipo": "number",
          "padrao": "0.95",
          "descricao": "Scale value when hovering over items (only applies if scaleOnHover is true)."
        },
        {
          "nome": "blurToFocus",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Whether items should animate from blurred to focused on initial load."
        },
        {
          "nome": "colorShiftOnHover",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Whether to show a color overlay effect on hover."
        }
      ],
      "totalProps": 9,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 256,
      "keywords": [
        "masonry",
        "mansory",
        "component",
        "gsap",
        "items",
        "ease",
        "duration",
        "stagger",
        "animatefrom",
        "scaleonhover",
        "hoverscale",
        "blurtofocus",
        "colorshiftonhover"
      ],
      "caminhoOrigem": "Components Animations\\Mansory.txt"
    },
    {
      "id": "meta_balls",
      "nome": "MetaBalls",
      "arquivo": "Meta Balls",
      "categoria": "component",
      "estilo": "particulas",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "color",
          "tipo": "string",
          "padrao": "#ffffff",
          "descricao": "The base color of the metaballs."
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "0.3",
          "descricao": "Speed multiplier for the animation."
        },
        {
          "nome": "enableMouseInteraction",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enables or disables the ball following the mouse."
        },
        {
          "nome": "enableTransparency",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Enables or disables transparency for the container of the animation."
        },
        {
          "nome": "hoverSmoothness",
          "tipo": "number",
          "padrao": "0.05",
          "descricao": "Smoothness factor for the cursor ball when following the mouse."
        },
        {
          "nome": "animationSize",
          "tipo": "number",
          "padrao": "30",
          "descricao": "The size of the world for the animation."
        },
        {
          "nome": "ballCount",
          "tipo": "number",
          "padrao": "15",
          "descricao": "Number of metaballs rendered."
        },
        {
          "nome": "clumpFactor",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Determines how close together the balls are rendered."
        },
        {
          "nome": "cursorBallSize",
          "tipo": "number",
          "padrao": "3",
          "descricao": "Size of the cursor-controlled ball."
        },
        {
          "nome": "cursorBallColor",
          "tipo": "string",
          "padrao": "#ff0000",
          "descricao": "Color of the cursor ball."
        }
      ],
      "totalProps": 10,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 282,
      "keywords": [
        "meta",
        "balls",
        "component",
        "ogl",
        "color",
        "speed",
        "enablemouseinteraction",
        "enabletransparency",
        "hoversmoothness",
        "animationsize",
        "ballcount",
        "clumpfactor",
        "cursorballsize",
        "cursorballcolor"
      ],
      "caminhoOrigem": "Components Animations\\Meta Balls.txt"
    },
    {
      "id": "metallic_paint",
      "nome": "MetallicPaint",
      "arquivo": "Metallic Paint",
      "categoria": "component",
      "estilo": "diverso",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "imageSrc",
          "tipo": "string",
          "padrao": "none (required)",
          "descricao": "URL or path to the image used for the metallic paint effect. The image is processed internally."
        },
        {
          "nome": "seed",
          "tipo": "number",
          "padrao": "42",
          "descricao": "Random seed for pattern generation. Different values create different pattern variations."
        },
        {
          "nome": "scale",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Scale of the metallic pattern. Higher values create more repetitions."
        },
        {
          "nome": "refraction",
          "tipo": "number",
          "padrao": "0.015",
          "descricao": "Amount of chromatic aberration (color separation). Creates the rainbow edge effect."
        },
        {
          "nome": "blur",
          "tipo": "number",
          "padrao": "0.005",
          "descricao": "Blur amount for the pattern transitions. Higher values create softer gradients."
        },
        {
          "nome": "liquid",
          "tipo": "number",
          "padrao": "0.07",
          "descricao": "Amount of liquid/wavy animation applied to the pattern."
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "0.3",
          "descricao": "Animation speed multiplier. Set to 0 to disable animation."
        },
        {
          "nome": "brightness",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Overall brightness of the metallic effect. Values above 1 increase brightness."
        },
        {
          "nome": "contrast",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Color contrast of the effect. Higher values create more distinct light/dark areas."
        },
        {
          "nome": "angle",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Rotation angle of the pattern in degrees."
        },
        {
          "nome": "fresnel",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Fresnel effect intensity. Controls edge highlighting based on viewing angle."
        },
        {
          "nome": "lightColor",
          "tipo": "string",
          "padrao": "#ffffff",
          "descricao": "Hex color for the bright/highlight areas of the metallic effect."
        },
        {
          "nome": "darkColor",
          "tipo": "string",
          "padrao": "#111111",
          "descricao": "Hex color for the dark/shadow areas of the metallic effect."
        },
        {
          "nome": "patternSharpness",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Controls the sharpness of metallic band transitions. Higher = sharper edges."
        },
        {
          "nome": "waveAmplitude",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Intensity of the wave distortion effect."
        },
        {
          "nome": "noiseScale",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Scale of the noise pattern. Higher = more detailed noise."
        },
        {
          "nome": "chromaticSpread",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Multiplier for chromatic aberration spread between RGB channels."
        },
        {
          "nome": "mouseAnimation",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "When true, mouse position controls wave animation instead of auto-loop."
        },
        {
          "nome": "distortion",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Amount of noise-based distortion applied to the pattern flow (0-1)."
        },
        {
          "nome": "contour",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Intensity of edge contour effect that warps the pattern along shape boundaries (0-1)."
        },
        {
          "nome": "tintColor",
          "tipo": "string",
          "padrao": "#ffffff",
          "descricao": "Hex color for color burn tint effect. White = no tint."
        }
      ],
      "totalProps": 21,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 147,
      "keywords": [
        "metallic",
        "paint",
        "component",
        "imagesrc",
        "seed",
        "scale",
        "refraction",
        "blur",
        "liquid",
        "speed",
        "brightness",
        "contrast",
        "angle",
        "fresnel",
        "lightcolor"
      ],
      "caminhoOrigem": "Components Animations\\Metallic Paint.txt"
    },
    {
      "id": "model_viewer",
      "nome": "ModelViewer",
      "arquivo": "Model Viewer",
      "categoria": "component",
      "estilo": "diverso",
      "dependencias": [
        "three",
        "@react-three/fiber",
        "@react-three/drei"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "url",
          "tipo": "string",
          "padrao": "-",
          "descricao": "URL of the 3D model file (glb/gltf/fbx/obj)"
        },
        {
          "nome": "width",
          "tipo": "number",
          "padrao": "string",
          "descricao": "400"
        },
        {
          "nome": "height",
          "tipo": "number",
          "padrao": "string",
          "descricao": "400"
        },
        {
          "nome": "modelXOffset",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Horizontal offset of the model"
        },
        {
          "nome": "modelYOffset",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Vertical offset of the model"
        },
        {
          "nome": "defaultRotationX",
          "tipo": "number",
          "padrao": "-50",
          "descricao": "Initial rotation on the X axis in degrees"
        },
        {
          "nome": "defaultRotationY",
          "tipo": "number",
          "padrao": "20",
          "descricao": "Initial rotation on the Y axis in degrees"
        }
      ],
      "totalProps": 7,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 43,
      "keywords": [
        "model",
        "viewer",
        "component",
        "three",
        "@react-three/fiber",
        "@react-three/drei",
        "url",
        "width",
        "height",
        "modelxoffset",
        "modelyoffset",
        "defaultrotationx",
        "defaultrotationy"
      ],
      "caminhoOrigem": "Components Animations\\Model Viewer.txt"
    },
    {
      "id": "noise",
      "nome": "Noise",
      "arquivo": "Noise",
      "categoria": "component",
      "estilo": "diverso",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "patternSize",
          "tipo": "number",
          "padrao": "250",
          "descricao": "Defines the size of the grain pattern."
        },
        {
          "nome": "patternScaleX",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Scaling factor for the X-axis of the grain pattern."
        },
        {
          "nome": "patternScaleY",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Scaling factor for the Y-axis of the grain pattern."
        },
        {
          "nome": "patternRefreshInterval",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Number of frames before the grain pattern refreshes."
        },
        {
          "nome": "patternAlpha",
          "tipo": "number",
          "padrao": "15",
          "descricao": "Opacity of the grain pattern (0-255)."
        }
      ],
      "totalProps": 5,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 72,
      "keywords": [
        "noise",
        "component",
        "patternsize",
        "patternscalex",
        "patternscaley",
        "patternrefreshinterval",
        "patternalpha"
      ],
      "caminhoOrigem": "Components Animations\\Noise.txt"
    },
    {
      "id": "option_whell",
      "nome": "OptionWheel",
      "arquivo": "Option Whell",
      "categoria": "component",
      "estilo": "diverso",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "items",
          "tipo": "string[]",
          "padrao": "[...]",
          "descricao": "Labels rendered as the wheel options."
        },
        {
          "nome": "defaultSelected",
          "tipo": "number",
          "padrao": "3",
          "descricao": "Index of the option selected on mount."
        },
        {
          "nome": "onChange",
          "tipo": "(index, item) => void",
          "padrao": "-",
          "descricao": "Called whenever the wheel settles on a new option."
        },
        {
          "nome": "textColor",
          "tipo": "string",
          "padrao": "\"#a6a6a6\"",
          "descricao": "Resting color of the option labels."
        },
        {
          "nome": "activeColor",
          "tipo": "string",
          "padrao": "\"#ffffff\"",
          "descricao": "Color an option blends toward as it reaches the middle of the wheel."
        },
        {
          "nome": "side",
          "tipo": "\"left\"",
          "padrao": "\"right\"",
          "descricao": "\"left\""
        },
        {
          "nome": "fontSize",
          "tipo": "number",
          "padrao": "3",
          "descricao": "Font size of the option labels in rem."
        },
        {
          "nome": "spacing",
          "tipo": "number",
          "padrao": "1.4",
          "descricao": "Vertical distance between options as a multiple of the font size."
        },
        {
          "nome": "curve",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Depth of the circular curve; 0 flattens the wheel into a straight list."
        },
        {
          "nome": "tilt",
          "tipo": "number",
          "padrao": "6",
          "descricao": "Angle in degrees between neighboring options; higher values curl the wheel tighter."
        },
        {
          "nome": "blur",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Blur in pixels added per step away from the middle."
        },
        {
          "nome": "fade",
          "tipo": "number",
          "padrao": "0.25",
          "descricao": "Opacity lost per step away from the middle."
        },
        {
          "nome": "minOpacity",
          "tipo": "number",
          "padrao": "0.05",
          "descricao": "Opacity floor for the furthest options."
        },
        {
          "nome": "smoothing",
          "tipo": "number",
          "padrao": "200",
          "descricao": "Easing time constant in milliseconds; higher values feel heavier."
        },
        {
          "nome": "inset",
          "tipo": "number",
          "padrao": "80",
          "descricao": "Padding in pixels between the anchored edge and the centered option."
        },
        {
          "nome": "loop",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Wrap around infinitely instead of stopping at the first and last option."
        },
        {
          "nome": "draggable",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Allow dragging the wheel with a pointer, in addition to scroll and arrow keys."
        },
        {
          "nome": "soundUrl",
          "tipo": "string",
          "padrao": "\"\"",
          "descricao": "URL of a short tick sound played when the selection changes; empty disables it."
        },
        {
          "nome": "soundVolume",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Playback volume of the tick sound."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "\"\"",
          "descricao": "Additional CSS classes for the outer wrapper."
        }
      ],
      "totalProps": 20,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 305,
      "keywords": [
        "option",
        "wheel",
        "whell",
        "component",
        "items",
        "defaultselected",
        "onchange",
        "textcolor",
        "activecolor",
        "side",
        "fontsize",
        "spacing",
        "curve",
        "tilt",
        "blur",
        "fade"
      ],
      "caminhoOrigem": "Components Animations\\Option Whell.txt"
    },
    {
      "id": "orb",
      "nome": "Orb",
      "arquivo": "Orb",
      "categoria": "background",
      "estilo": "luz",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "hue",
          "tipo": "number",
          "padrao": "0",
          "descricao": "The base hue for the orb (in degrees)."
        },
        {
          "nome": "hoverIntensity",
          "tipo": "number",
          "padrao": "0.2",
          "descricao": "Controls the intensity of the hover distortion effect."
        },
        {
          "nome": "rotateOnHover",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Toggle to enable or disable continuous rotation on hover."
        },
        {
          "nome": "forceHoverState",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Force hover animations even when the orb is not actually hovered."
        },
        {
          "nome": "backgroundColor",
          "tipo": "string",
          "padrao": "#000000",
          "descricao": "The background color of the container."
        }
      ],
      "totalProps": 5,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 344,
      "keywords": [
        "orb",
        "background",
        "ogl",
        "hue",
        "hoverintensity",
        "rotateonhover",
        "forcehoverstate",
        "backgroundcolor"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Orb.txt"
    },
    {
      "id": "orbit_images",
      "nome": "OrbitImages",
      "arquivo": "Orbit Images",
      "categoria": "component",
      "estilo": "luz",
      "dependencias": [
        "motion"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "images",
          "tipo": "string[]",
          "padrao": "[]",
          "descricao": "Array of image URLs to orbit along the path."
        },
        {
          "nome": "altPrefix",
          "tipo": "string",
          "padrao": "\"Orbiting image\"",
          "descricao": "Prefix for auto-generated alt attributes."
        },
        {
          "nome": "shape",
          "tipo": "string",
          "padrao": "\"ellipse\"",
          "descricao": "Preset shape: ellipse, circle, square, rectangle, triangle, star, heart, infinity, wave, or custom."
        },
        {
          "nome": "customPath",
          "tipo": "string",
          "padrao": "undefined",
          "descricao": "Custom SVG path string (used when shape=\"custom\")."
        },
        {
          "nome": "baseWidth",
          "tipo": "number",
          "padrao": "1400",
          "descricao": "Base width for the design coordinate space used for responsive scaling."
        },
        {
          "nome": "radiusX",
          "tipo": "number",
          "padrao": "700",
          "descricao": "Horizontal radius for ellipse/rectangle shapes."
        },
        {
          "nome": "radiusY",
          "tipo": "number",
          "padrao": "170",
          "descricao": "Vertical radius for ellipse/rectangle shapes."
        },
        {
          "nome": "radius",
          "tipo": "number",
          "padrao": "300",
          "descricao": "Radius for circle, square, triangle, star, heart shapes."
        },
        {
          "nome": "starPoints",
          "tipo": "number",
          "padrao": "5",
          "descricao": "Number of points for star shape."
        },
        {
          "nome": "starInnerRatio",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Inner radius ratio for star (0-1)."
        },
        {
          "nome": "rotation",
          "tipo": "number",
          "padrao": "-8",
          "descricao": "Rotation angle of the entire orbit path in degrees."
        },
        {
          "nome": "duration",
          "tipo": "number",
          "padrao": "40",
          "descricao": "Duration of one complete orbit in seconds."
        },
        {
          "nome": "itemSize",
          "tipo": "number",
          "padrao": "64",
          "descricao": "Width/height of each orbiting item in pixels."
        },
        {
          "nome": "direction",
          "tipo": "string",
          "padrao": "\"normal\"",
          "descricao": "Animation direction: \"normal\" or \"reverse\"."
        },
        {
          "nome": "fill",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Whether to distribute items evenly around the orbit."
        },
        {
          "nome": "width",
          "tipo": "number",
          "padrao": "\"100%\"",
          "descricao": "100"
        },
        {
          "nome": "height",
          "tipo": "number",
          "padrao": "\"auto\"",
          "descricao": "100"
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "\"\"",
          "descricao": "Additional CSS class for the container."
        },
        {
          "nome": "showPath",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Whether to show the orbit path for debugging."
        },
        {
          "nome": "pathColor",
          "tipo": "string",
          "padrao": "\"rgba(0,0,0,0.1)\"",
          "descricao": "Stroke color when showPath is true."
        },
        {
          "nome": "pathWidth",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Stroke width when showPath is true."
        },
        {
          "nome": "easing",
          "tipo": "string",
          "padrao": "\"linear\"",
          "descricao": "Animation easing: linear, easeIn, easeOut, easeInOut."
        },
        {
          "nome": "paused",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Whether the animation is paused."
        },
        {
          "nome": "centerContent",
          "tipo": "ReactNode",
          "padrao": "undefined",
          "descricao": "Custom content rendered at the center of the orbit."
        },
        {
          "nome": "responsive",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Enable responsive scaling based on container width."
        }
      ],
      "totalProps": 25,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 19,
      "keywords": [
        "orbit",
        "images",
        "component",
        "motion",
        "altprefix",
        "shape",
        "custompath",
        "basewidth",
        "radiusx",
        "radiusy",
        "radius",
        "starpoints",
        "starinnerratio",
        "rotation",
        "duration"
      ],
      "caminhoOrigem": "Components Animations\\Orbit Images.txt"
    },
    {
      "id": "particles",
      "nome": "Particles",
      "arquivo": "Particles",
      "categoria": "background",
      "estilo": "particulas",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "particleCount",
          "tipo": "number",
          "padrao": "200",
          "descricao": "The number of particles to generate."
        },
        {
          "nome": "particleSpread",
          "tipo": "number",
          "padrao": "10",
          "descricao": "Controls how far particles are spread from the center."
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "Speed factor controlling the animation pace."
        },
        {
          "nome": "particleColors",
          "tipo": "string[]",
          "padrao": "['#ffffff']",
          "descricao": "An array of hex color strings used to color the particles."
        },
        {
          "nome": "moveParticlesOnHover",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Determines if particles should move in response to mouse hover."
        },
        {
          "nome": "particleHoverFactor",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Multiplier for the particle movement when hovering."
        },
        {
          "nome": "alphaParticles",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "If true, particles are rendered with varying transparency; otherwise, as solid circles."
        },
        {
          "nome": "particleBaseSize",
          "tipo": "number",
          "padrao": "100",
          "descricao": "The base size of the particles."
        },
        {
          "nome": "sizeRandomness",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Controls the variation in particle sizes (0 means all particles have the same size)."
        },
        {
          "nome": "cameraDistance",
          "tipo": "number",
          "padrao": "20",
          "descricao": "Distance from the camera to the particle system."
        },
        {
          "nome": "disableRotation",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "If true, stops the particle system from rotating."
        },
        {
          "nome": "pixelRatio",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Sets the pixel ratio for sharper rendering on high-DPI screens."
        }
      ],
      "totalProps": 12,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 247,
      "keywords": [
        "particles",
        "background",
        "ogl",
        "particlecount",
        "particlespread",
        "speed",
        "particlecolors",
        "moveparticlesonhover",
        "particlehoverfactor",
        "alphaparticles",
        "particlebasesize",
        "sizerandomness",
        "cameradistance",
        "disablerotation",
        "pixelratio"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Particles.txt"
    },
    {
      "id": "particulas",
      "nome": "Antigravity",
      "arquivo": "Partículas",
      "categoria": "component",
      "estilo": "diverso",
      "dependencias": [
        "three",
        "@react-three/fiber"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "count",
          "tipo": "number",
          "padrao": "300",
          "descricao": "Number of particles"
        },
        {
          "nome": "magnetRadius",
          "tipo": "number",
          "padrao": "10",
          "descricao": "Radius of the magnetic field"
        },
        {
          "nome": "ringRadius",
          "tipo": "number",
          "padrao": "10",
          "descricao": "Radius of the formed ring"
        },
        {
          "nome": "waveSpeed",
          "tipo": "number",
          "padrao": "0.4",
          "descricao": "Speed of the wave animation"
        },
        {
          "nome": "waveAmplitude",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Intensity of the wave (0 for perfect circle)"
        },
        {
          "nome": "particleSize",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Scale multiplier for particles"
        },
        {
          "nome": "lerpSpeed",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "How fast particles move to the ring"
        },
        {
          "nome": "color",
          "tipo": "string",
          "padrao": "#FF9FFC",
          "descricao": "Color of the particles"
        },
        {
          "nome": "autoAnimate",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Automatically animate when idle"
        },
        {
          "nome": "particleVariance",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Variance in particle size (0-1)"
        },
        {
          "nome": "rotationSpeed",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Rotation speed of the ring"
        },
        {
          "nome": "depthFactor",
          "tipo": "number",
          "padrao": "1",
          "descricao": ""
        }
      ],
      "totalProps": 12,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 182,
      "keywords": [
        "antigravity",
        "partículas",
        "component",
        "three",
        "@react-three/fiber",
        "count",
        "magnetradius",
        "ringradius",
        "wavespeed",
        "waveamplitude",
        "particlesize",
        "lerpspeed",
        "color",
        "autoanimate",
        "particlevariance",
        "rotationspeed",
        "depthfactor"
      ],
      "caminhoOrigem": "Components Animations\\Partículas.txt"
    },
    {
      "id": "pill_nav",
      "nome": "PillNav",
      "arquivo": "Pill Nav",
      "categoria": "component",
      "estilo": "navegacao",
      "dependencias": [
        "gsap"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "logo",
          "tipo": "string",
          "padrao": "-",
          "descricao": "URL for the logo image"
        },
        {
          "nome": "logoAlt",
          "tipo": "string",
          "padrao": "Logo",
          "descricao": "Alt text for the logo image"
        },
        {
          "nome": "items",
          "tipo": "PillNavItem[]",
          "padrao": "-",
          "descricao": "Array of navigation items with label, href, and optional ariaLabel"
        },
        {
          "nome": "activeHref",
          "tipo": "string",
          "padrao": "undefined",
          "descricao": "The href of the currently active navigation item"
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "''",
          "descricao": "Additional CSS classes for the navigation container"
        },
        {
          "nome": "ease",
          "tipo": "string",
          "padrao": "power3.easeOut",
          "descricao": "GSAP easing function for animations"
        },
        {
          "nome": "baseColor",
          "tipo": "string",
          "padrao": "#fff",
          "descricao": "Base background color for the navigation"
        },
        {
          "nome": "pillColor",
          "tipo": "string",
          "padrao": "#120F17",
          "descricao": "Background color for navigation pills"
        },
        {
          "nome": "hoveredPillTextColor",
          "tipo": "string",
          "padrao": "#120F17",
          "descricao": "Text color when hovering over pills"
        },
        {
          "nome": "pillTextColor",
          "tipo": "string",
          "padrao": "baseColor",
          "descricao": "Text color for navigation pills"
        },
        {
          "nome": "onMobileMenuClick",
          "tipo": "() => void",
          "padrao": "undefined",
          "descricao": "Callback function triggered when mobile menu button is clicked"
        },
        {
          "nome": "initialLoadAnimation",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Enable initial load animation for logo scale and nav items reveal"
        }
      ],
      "totalProps": 12,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 354,
      "keywords": [
        "pill",
        "nav",
        "component",
        "gsap",
        "logo",
        "logoalt",
        "items",
        "activehref",
        "classname",
        "ease",
        "basecolor",
        "pillcolor",
        "hoveredpilltextcolor",
        "pilltextcolor",
        "onmobilemenuclick",
        "initialloadanimation"
      ],
      "caminhoOrigem": "Components Animations\\Pill Nav.txt"
    },
    {
      "id": "pixel_blast",
      "nome": "PixelBlast",
      "arquivo": "Pixel Blast",
      "categoria": "background",
      "estilo": "particulas",
      "dependencias": [
        "three",
        "postprocessing"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "variant",
          "tipo": "'square'",
          "padrao": "'circle'",
          "descricao": "'triangle'"
        },
        {
          "nome": "pixelSize",
          "tipo": "number",
          "padrao": "4",
          "descricao": "Base pixel size (auto scaled for DPI)."
        },
        {
          "nome": "color",
          "tipo": "string",
          "padrao": "'#B497CF'",
          "descricao": "Pixel color."
        },
        {
          "nome": "patternScale",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Noise/pattern scale."
        },
        {
          "nome": "patternDensity",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Pattern density adjustment."
        },
        {
          "nome": "pixelSizeJitter",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Random jitter applied to coverage."
        },
        {
          "nome": "enableRipples",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enable click ripple waves."
        },
        {
          "nome": "rippleSpeed",
          "tipo": "number",
          "padrao": "0.3",
          "descricao": "Ripple propagation speed."
        },
        {
          "nome": "rippleThickness",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "Ripple ring thickness."
        },
        {
          "nome": "rippleIntensityScale",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Ripple intensity multiplier."
        },
        {
          "nome": "liquid",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Enable liquid distortion effect."
        },
        {
          "nome": "liquidStrength",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "Liquid distortion strength."
        },
        {
          "nome": "liquidRadius",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Liquid touch brush radius scale."
        },
        {
          "nome": "liquidWobbleSpeed",
          "tipo": "number",
          "padrao": "4.5",
          "descricao": "Liquid wobble frequency."
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Animation time scale."
        },
        {
          "nome": "edgeFade",
          "tipo": "number",
          "padrao": "0.25",
          "descricao": "Edge fade distance (0-1)."
        },
        {
          "nome": "noiseAmount",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Post noise amount."
        },
        {
          "nome": "transparent",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Transparent background."
        }
      ],
      "totalProps": 18,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 612,
      "keywords": [
        "pixel",
        "blast",
        "background",
        "three",
        "postprocessing",
        "variant",
        "pixelsize",
        "color",
        "patternscale",
        "patterndensity",
        "pixelsizejitter",
        "enableripples",
        "ripplespeed",
        "ripplethickness",
        "rippleintensityscale",
        "liquid",
        "liquidstrength"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Pixel Blast.txt"
    },
    {
      "id": "pixel_card",
      "nome": "PixelCard",
      "arquivo": "Pixel Card",
      "categoria": "component",
      "estilo": "particulas",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "variant",
          "tipo": "string",
          "padrao": "\"default\"",
          "descricao": "Defines the color scheme and animation style."
        },
        {
          "nome": "gap",
          "tipo": "number",
          "padrao": "varies by variant",
          "descricao": "Pixel grid gap size in pixels."
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "varies by variant",
          "descricao": "Animation speed modifier (lower is slower)."
        },
        {
          "nome": "colors",
          "tipo": "string",
          "padrao": "\"#f8fafc,#f1f5f9,#cbd5e1\"",
          "descricao": "Comma-separated list of colors for the pixel effect."
        },
        {
          "nome": "noFocus",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "If true, prevents animation from triggering on focus."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "\"\"",
          "descricao": "Additional CSS class for the wrapper."
        },
        {
          "nome": "style",
          "tipo": "object",
          "padrao": "{}",
          "descricao": "Inline styles for the wrapper."
        },
        {
          "nome": "children",
          "tipo": "ReactNode",
          "padrao": "null",
          "descricao": "Content to render inside the pixel effect container."
        }
      ],
      "totalProps": 8,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 244,
      "keywords": [
        "pixel",
        "card",
        "component",
        "variant",
        "gap",
        "speed",
        "colors",
        "nofocus",
        "classname",
        "style",
        "children"
      ],
      "caminhoOrigem": "Components Animations\\Pixel Card.txt"
    },
    {
      "id": "pixel_snou",
      "nome": "PixelSnow",
      "arquivo": "Pixel Snou",
      "categoria": "background",
      "estilo": "particulas",
      "dependencias": [
        "three"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "color",
          "tipo": "string",
          "padrao": "\"#ffffff\"",
          "descricao": "Color of the snowflakes (hex or CSS color)"
        },
        {
          "nome": "flakeSize",
          "tipo": "number",
          "padrao": "0.01",
          "descricao": "Size of snowflakes in scene units"
        },
        {
          "nome": "minFlakeSize",
          "tipo": "number",
          "padrao": "1.25",
          "descricao": "Minimum flake size in pixels on screen"
        },
        {
          "nome": "pixelResolution",
          "tipo": "number",
          "padrao": "200",
          "descricao": "Pixel resolution - lower values create larger pixels for a more retro look"
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "1.25",
          "descricao": "Animation speed multiplier"
        },
        {
          "nome": "depthFade",
          "tipo": "number",
          "padrao": "8",
          "descricao": "Depth fade intensity - higher values make distant flakes fade faster"
        },
        {
          "nome": "farPlane",
          "tipo": "number",
          "padrao": "20",
          "descricao": "Far plane distance for rendering - higher values show more distant flakes"
        },
        {
          "nome": "brightness",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Overall brightness multiplier"
        },
        {
          "nome": "gamma",
          "tipo": "number",
          "padrao": "0.4545",
          "descricao": "Gamma correction value for final color output"
        },
        {
          "nome": "density",
          "tipo": "number",
          "padrao": "0.3",
          "descricao": "Probability of snowflakes appearing (0-1) - lower values = fewer flakes"
        },
        {
          "nome": "variant",
          "tipo": "\"square\"",
          "padrao": "\"round\"",
          "descricao": "\"snowflake\""
        },
        {
          "nome": "direction",
          "tipo": "number",
          "padrao": "125",
          "descricao": "Wind direction angle in degrees (0-360)"
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "\"\"",
          "descricao": "Additional CSS class name"
        },
        {
          "nome": "style",
          "tipo": "object",
          "padrao": "{}",
          "descricao": "Additional inline styles"
        }
      ],
      "totalProps": 14,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 359,
      "keywords": [
        "pixel",
        "snow",
        "snou",
        "background",
        "three",
        "color",
        "flakesize",
        "minflakesize",
        "pixelresolution",
        "speed",
        "depthfade",
        "farplane",
        "brightness",
        "gamma",
        "density",
        "variant",
        "direction"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Pixel Snou.txt"
    },
    {
      "id": "pixel_trail",
      "nome": "PixelTrail",
      "arquivo": "Pixel Trail",
      "categoria": "component",
      "estilo": "particulas",
      "dependencias": [
        "three",
        "@react-three/fiber",
        "@react-three/drei"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "gridSize",
          "tipo": "number",
          "padrao": "40",
          "descricao": "Number of pixels in grid."
        },
        {
          "nome": "trailSize",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "Size of each trail dot."
        },
        {
          "nome": "maxAge",
          "tipo": "number",
          "padrao": "500",
          "descricao": "Duration of the trail effect."
        },
        {
          "nome": "interpolate",
          "tipo": "number",
          "padrao": "5",
          "descricao": "Interpolation factor for pointer movement."
        },
        {
          "nome": "color",
          "tipo": "string",
          "padrao": "#ffffff",
          "descricao": "Pixel color."
        },
        {
          "nome": "gooeyFilter",
          "tipo": "object",
          "padrao": "{ id: 'custom-goo-filter', strength: 5 }",
          "descricao": "Configuration for gooey filter."
        }
      ],
      "totalProps": 6,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 142,
      "keywords": [
        "pixel",
        "trail",
        "component",
        "three",
        "@react-three/fiber",
        "@react-three/drei",
        "gridsize",
        "trailsize",
        "maxage",
        "interpolate",
        "color",
        "gooeyfilter"
      ],
      "caminhoOrigem": "Components Animations\\Pixel Trail.txt"
    },
    {
      "id": "pixel_transition",
      "nome": "PixelTransition",
      "arquivo": "Pixel Transition",
      "categoria": "component",
      "estilo": "particulas",
      "dependencias": [
        "gsap"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "firstContent",
          "tipo": "ReactNode",
          "padrao": "string",
          "descricao": "—"
        },
        {
          "nome": "secondContent",
          "tipo": "ReactNode",
          "padrao": "string",
          "descricao": "—"
        },
        {
          "nome": "gridSize",
          "tipo": "number",
          "padrao": "7",
          "descricao": "Number of rows/columns in the pixel grid."
        },
        {
          "nome": "pixelColor",
          "tipo": "string",
          "padrao": "currentColor",
          "descricao": "Background color used for each pixel block."
        },
        {
          "nome": "animationStepDuration",
          "tipo": "number",
          "padrao": "0.3",
          "descricao": "Length of the pixel reveal/hide in seconds."
        },
        {
          "nome": "aspectRatio",
          "tipo": "string",
          "padrao": "\"100%\"",
          "descricao": "Sets the 'padding-top' (or aspect-ratio) for the container."
        },
        {
          "nome": "once",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "If true, the transition will not revert on mouse leave or subsequent clicks."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "—",
          "descricao": "Optional additional class names for styling."
        },
        {
          "nome": "style",
          "tipo": "object",
          "padrao": "{}",
          "descricao": "Optional inline styles for the container."
        }
      ],
      "totalProps": 9,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 131,
      "keywords": [
        "pixel",
        "transition",
        "component",
        "gsap",
        "firstcontent",
        "secondcontent",
        "gridsize",
        "pixelcolor",
        "animationstepduration",
        "aspectratio",
        "once",
        "classname",
        "style"
      ],
      "caminhoOrigem": "Components Animations\\Pixel Transition.txt"
    },
    {
      "id": "plasma",
      "nome": "Plasma",
      "arquivo": "Plasma",
      "categoria": "background",
      "estilo": "fluido",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "color",
          "tipo": "string",
          "padrao": "undefined",
          "descricao": "Optional hex color to tint the plasma effect. If not provided, uses original colors."
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Animation speed multiplier. Higher values = faster animation."
        },
        {
          "nome": "direction",
          "tipo": "'forward'",
          "padrao": "'reverse'",
          "descricao": "'pingpong'"
        },
        {
          "nome": "scale",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": ""
        }
      ],
      "totalProps": 4,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 243,
      "keywords": [
        "plasma",
        "background",
        "ogl",
        "color",
        "speed",
        "direction",
        "scale"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Plasma.txt"
    },
    {
      "id": "plasma_wave",
      "nome": "PlasmaWave",
      "arquivo": "Plasma Wave",
      "categoria": "background",
      "estilo": "fluido",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "colors",
          "tipo": "[string, string]",
          "padrao": "[\"#A855F7\", \"#06B6D4\"]",
          "descricao": "Array of two hex colors — one for each plasma wave band."
        },
        {
          "nome": "speed1",
          "tipo": "number",
          "padrao": "0.05",
          "descricao": "Speed of the first plasma wave."
        },
        {
          "nome": "speed2",
          "tipo": "number",
          "padrao": "0.05",
          "descricao": "Speed of the second plasma wave."
        },
        {
          "nome": "dir2",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Direction multiplier for the second wave. Use -1 to reverse."
        },
        {
          "nome": "focalLength",
          "tipo": "number",
          "padrao": "0.8",
          "descricao": "Focal length of the camera projection."
        },
        {
          "nome": "bend1",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Bend intensity of the first wave."
        },
        {
          "nome": "bend2",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Bend intensity of the second wave."
        },
        {
          "nome": "rotationDeg",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Rotation angle of the scene in degrees."
        },
        {
          "nome": "xOffset",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Horizontal offset of the viewport."
        },
        {
          "nome": "yOffset",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Vertical offset of the viewport."
        }
      ],
      "totalProps": 10,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 242,
      "keywords": [
        "plasma",
        "wave",
        "background",
        "ogl",
        "colors",
        "speed1",
        "speed2",
        "dir2",
        "focallength",
        "bend1",
        "bend2",
        "rotationdeg",
        "xoffset",
        "yoffset"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Plasma Wave.txt"
    },
    {
      "id": "prism",
      "nome": "Prism",
      "arquivo": "Prism",
      "categoria": "background",
      "estilo": "luz",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "height",
          "tipo": "number",
          "padrao": "3.5",
          "descricao": "Apex height of the prism (world units)."
        },
        {
          "nome": "baseWidth",
          "tipo": "number",
          "padrao": "5.5",
          "descricao": "Total base width across X/"
        }
      ],
      "totalProps": 2,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 43,
      "keywords": [
        "prism",
        "background",
        "ogl",
        "height",
        "basewidth"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Prism.txt"
    },
    {
      "id": "prismatic_burst",
      "nome": "PrismaticBurst",
      "arquivo": "Prismatic Burst",
      "categoria": "background",
      "estilo": "luz",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "intensity",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Overall brightness multiplier applied after accumulation."
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Global time multiplier controlling ray motion & distortion."
        },
        {
          "nome": "animationType",
          "tipo": "\"rotate\"",
          "padrao": "\"rotate3d\"",
          "descricao": "\"hover\""
        },
        {
          "nome": "colors",
          "tipo": "string[]",
          "padrao": "[]",
          "descricao": "Optional array of hex colors used as a gradient (otherwise spectral)"
        },
        {
          "nome": "distort",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Amount of bend/distortion applied to marching space (adds organic wobble)"
        },
        {
          "nome": "paused",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Freeze time progression when true (animation stops)"
        },
        {
          "nome": "offset",
          "tipo": "{ x?: number",
          "padrao": "string; y?: number",
          "descricao": "string }"
        },
        {
          "nome": "hoverDampness",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Smoothing factor (0-1) for pointer tracking when animationType='hover'"
        },
        {
          "nome": "rayCount",
          "tipo": "number",
          "padrao": "undefined",
          "descricao": "If > 0 applies an angular comb filter to produce discrete ray spokes"
        },
        {
          "nome": "mixBlendMode",
          "tipo": "CSSProperties['mixBlendMode']",
          "padrao": "'none'",
          "descricao": "\"lighten\""
        }
      ],
      "totalProps": 10,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 76,
      "keywords": [
        "prismatic",
        "burst",
        "background",
        "ogl",
        "intensity",
        "speed",
        "animationtype",
        "colors",
        "distort",
        "paused",
        "offset",
        "hoverdampness",
        "raycount",
        "mixblendmode"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Prismatic Burst.txt"
    },
    {
      "id": "profile_card",
      "nome": "ProfileCard",
      "arquivo": "Profile Card",
      "categoria": "component",
      "estilo": "card",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "avatarUrl",
          "tipo": "string",
          "padrao": "\"<Placeholder for avatar URL>\"",
          "descricao": "URL for the main avatar image displayed on the card"
        },
        {
          "nome": "iconUrl",
          "tipo": "string",
          "padrao": "\"<Placeholder for icon URL>\"",
          "descricao": "Optional URL for an icon pattern overlay on the card background"
        },
        {
          "nome": "grainUrl",
          "tipo": "string",
          "padrao": "\"<Placeholder for grain URL>\"",
          "descricao": "Optional URL for a grain texture overlay effect"
        },
        {
          "nome": "innerGradient",
          "tipo": "string",
          "padrao": "undefined",
          "descricao": "Custom CSS gradient string for the inner card gradient"
        },
        {
          "nome": "behindGlowEnabled",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Toggle the smooth radial glow that follows the cursor behind the card"
        },
        {
          "nome": "behindGlowColor",
          "tipo": "string",
          "padrao": "\"rgba(125, 190, 255, 0.67)\"",
          "descricao": "CSS color for the behind-the-card glow (e.g. rgba/hsla/hex)"
        },
        {
          "nome": "behindGlowSize",
          "tipo": "string",
          "padrao": "\"50%\"",
          "descricao": "Size of the glow as a length/percentage stop in the radial gradient"
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "\"\"",
          "descricao": "Additional CSS classes to apply to the card wrapper"
        },
        {
          "nome": "enableTilt",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enable or disable the 3D tilt effect on mouse hover"
        },
        {
          "nome": "enableMobileTilt",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Enable or disable the 3D tilt effect on mobile devices"
        },
        {
          "nome": "mobileTiltSensitivity",
          "tipo": "number",
          "padrao": "5",
          "descricao": "Sensitivity of the 3D tilt effect on mobile devices"
        },
        {
          "nome": "miniAvatarUrl",
          "tipo": "string",
          "padrao": "undefined",
          "descricao": "Optional URL for a smaller avatar in the user info section"
        },
        {
          "nome": "name",
          "tipo": "string",
          "padrao": "\"Javi A. Torres\"",
          "descricao": "User's display name"
        },
        {
          "nome": "title",
          "tipo": "string",
          "padrao": "\"Software Engineer\"",
          "descricao": "User's job title or role"
        },
        {
          "nome": "handle",
          "tipo": "string",
          "padrao": "\"javicodes\"",
          "descricao": "User's handle or username (displayed with @ prefix)"
        },
        {
          "nome": "status",
          "tipo": "string",
          "padrao": "\"Online\"",
          "descricao": "User's current status"
        },
        {
          "nome": "contactText",
          "tipo": "string",
          "padrao": "\"Contact\"",
          "descricao": "Text displayed on the contact button"
        },
        {
          "nome": "showUserInfo",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Whether to display the user information section"
        },
        {
          "nome": "onContactClick",
          "tipo": "function",
          "padrao": "undefined",
          "descricao": "Callback function called when the contact button is clicked"
        }
      ],
      "totalProps": 19,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 375,
      "keywords": [
        "profile",
        "card",
        "component",
        "avatarurl",
        "iconurl",
        "grainurl",
        "innergradient",
        "behindglowenabled",
        "behindglowcolor",
        "behindglowsize",
        "classname",
        "enabletilt",
        "enablemobiletilt",
        "mobiletiltsensitivity",
        "miniavatarurl"
      ],
      "caminhoOrigem": "Components Animations\\Profile Card.txt"
    },
    {
      "id": "radar",
      "nome": "Radar",
      "arquivo": "Radar",
      "categoria": "background",
      "estilo": "diverso",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Overall animation speed multiplier."
        },
        {
          "nome": "scale",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": ""
        }
      ],
      "totalProps": 2,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 209,
      "keywords": [
        "radar",
        "background",
        "ogl",
        "speed",
        "scale"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Radar.txt"
    },
    {
      "id": "reflective_card",
      "nome": "ReflectiveCard",
      "arquivo": "Reflective Card",
      "categoria": "component",
      "estilo": "card",
      "dependencias": [
        "lucide-react"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "blurStrength",
          "tipo": "number",
          "padrao": "12",
          "descricao": "The intensity of the blur effect (0-20px)"
        },
        {
          "nome": "metalness",
          "tipo": "number",
          "padrao": "1",
          "descricao": "The opacity of the metallic sheen (0-1)"
        },
        {
          "nome": "roughness",
          "tipo": "number",
          "padrao": "0.4",
          "descricao": "The opacity of the noise texture (0-1)"
        },
        {
          "nome": "displacementStrength",
          "tipo": "number",
          "padrao": "20",
          "descricao": "Strength of the displacement (how much it warps)"
        },
        {
          "nome": "noiseScale",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Scale of the noise texture (size of the ripples)"
        },
        {
          "nome": "specularConstant",
          "tipo": "number",
          "padrao": "1.2",
          "descricao": "Specular constant for the lighting (shininess)"
        },
        {
          "nome": "grayscale",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Grayscale intensity (0-1)"
        },
        {
          "nome": "glassDistortion",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Strength of the glass edge distortion"
        },
        {
          "nome": "color",
          "tipo": "string",
          "padrao": "white",
          "descricao": "The base text color"
        },
        {
          "nome": "overlayColor",
          "tipo": "string",
          "padrao": "rgba(255, 255, 255, 0.1)",
          "descricao": "The color of the overlay tint"
        }
      ],
      "totalProps": 10,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 152,
      "keywords": [
        "reflective",
        "card",
        "component",
        "lucide-react",
        "blurstrength",
        "metalness",
        "roughness",
        "displacementstrength",
        "noisescale",
        "specularconstant",
        "grayscale",
        "glassdistortion",
        "color",
        "overlaycolor"
      ],
      "caminhoOrigem": "Components Animations\\Reflective Card.txt"
    },
    {
      "id": "ribbons",
      "nome": "Ribbons",
      "arquivo": "Ribbons",
      "categoria": "component",
      "estilo": "diverso",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "colors",
          "tipo": "string[]",
          "padrao": "['#5227FF']",
          "descricao": "An array of color strings to be used for the ribbons."
        },
        {
          "nome": "baseSpring",
          "tipo": "number",
          "padrao": "0.03",
          "descricao": "Base spring factor for the physics controlling ribbon motion."
        },
        {
          "nome": "baseFriction",
          "tipo": "number",
          "padrao": "0.9",
          "descricao": "Base friction factor that dampens the ribbon motion."
        },
        {
          "nome": "baseThickness",
          "tipo": "number",
          "padrao": "30",
          "descricao": "The base thickness of the ribbons."
        },
        {
          "nome": "offsetFactor",
          "tipo": "number",
          "padrao": "0.02",
          "descricao": "A factor to horizontally offset the starting positions of the ribbons."
        },
        {
          "nome": "maxAge",
          "tipo": "number",
          "padrao": "500",
          "descricao": "Delay in milliseconds controlling how long the ribbon trails extend."
        },
        {
          "nome": "pointCount",
          "tipo": "number",
          "padrao": "50",
          "descricao": "The number of points that make up each ribbon."
        },
        {
          "nome": "speedMultiplier",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Multiplier that adjusts how fast trailing points interpolate towards the head."
        },
        {
          "nome": "enableFade",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "If true, a fade effect is applied along the length of the ribbon."
        },
        {
          "nome": "enableShaderEffect",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "If true, an additional sine-wave shader effect is applied to the ribbons."
        },
        {
          "nome": "effectAmplitude",
          "tipo": "number",
          "padrao": "2",
          "descricao": "The amplitude of the shader displacement effect."
        },
        {
          "nome": "backgroundColor",
          "tipo": "number[]",
          "padrao": "[0, 0, 0, 0]",
          "descricao": "An RGBA array specifying the clear color for the renderer."
        }
      ],
      "totalProps": 12,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 240,
      "keywords": [
        "ribbons",
        "component",
        "ogl",
        "colors",
        "basespring",
        "basefriction",
        "basethickness",
        "offsetfactor",
        "maxage",
        "pointcount",
        "speedmultiplier",
        "enablefade",
        "enableshadereffect",
        "effectamplitude",
        "backgroundcolor"
      ],
      "caminhoOrigem": "Components Animations\\Ribbons.txt"
    },
    {
      "id": "ripple_grid",
      "nome": "RippleGrid",
      "arquivo": "Ripple Grid",
      "categoria": "background",
      "estilo": "fluido",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "enableRainbow",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Enables rainbow color cycling animation for the grid."
        },
        {
          "nome": "gridColor",
          "tipo": "string",
          "padrao": "'#ffffff'",
          "descricao": "Color of the grid when rainbow mode is disabled."
        },
        {
          "nome": "rippleIntensity",
          "tipo": "number",
          "padrao": "0.05",
          "descricao": "Controls the intensity of the ripple effect from the center."
        },
        {
          "nome": "gridSize",
          "tipo": "number",
          "padrao": "10.0",
          "descricao": "Controls the density/size of the grid pattern."
        },
        {
          "nome": "gridThickness",
          "tipo": "number",
          "padrao": "15.0",
          "descricao": "Controls the thickness of the grid lines."
        },
        {
          "nome": "fadeDistance",
          "tipo": "number",
          "padrao": "1.5",
          "descricao": "Controls how far the fade effect extends from the center."
        },
        {
          "nome": "vignetteStrength",
          "tipo": "number",
          "padrao": "2.0",
          "descricao": "Controls the intensity of the vignette (edge darkening) effect."
        },
        {
          "nome": "glowIntensity",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "Adds a glow effect to the grid lines."
        },
        {
          "nome": "opacity",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Overall opacity of the entire effect."
        },
        {
          "nome": "gridRotation",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Rotate the entire grid pattern by degrees."
        },
        {
          "nome": "mouseInteraction",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Enable mouse/touch interaction to create ripples."
        },
        {
          "nome": "mouseInteractionRadius",
          "tipo": "number",
          "padrao": "0.8",
          "descricao": "Controls the radius of the mouse interaction effect."
        }
      ],
      "totalProps": 12,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 280,
      "keywords": [
        "ripple",
        "grid",
        "background",
        "ogl",
        "enablerainbow",
        "gridcolor",
        "rippleintensity",
        "gridsize",
        "gridthickness",
        "fadedistance",
        "vignettestrength",
        "glowintensity",
        "opacity",
        "gridrotation",
        "mouseinteraction",
        "mouseinteractionradius"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Ripple Grid.txt"
    },
    {
      "id": "scroll_stack",
      "nome": "ScrollStack",
      "arquivo": "Scroll Stack",
      "categoria": "component",
      "estilo": "card",
      "dependencias": [
        "lenis"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "children",
          "tipo": "ReactNode",
          "padrao": "required",
          "descricao": "The content to be displayed in the scroll stack. Should contain ScrollStackItem components."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "\"\"",
          "descricao": "Additional CSS classes to apply to the scroll stack container."
        },
        {
          "nome": "itemDistance",
          "tipo": "number",
          "padrao": "100",
          "descricao": "Distance between stacked items in pixels."
        },
        {
          "nome": "itemScale",
          "tipo": "number",
          "padrao": "0.03",
          "descricao": "Scale increment for each stacked item."
        },
        {
          "nome": "itemStackDistance",
          "tipo": "number",
          "padrao": "30",
          "descricao": "Distance between items when they start stacking."
        },
        {
          "nome": "stackPosition",
          "tipo": "string",
          "padrao": "\"20%\"",
          "descricao": "Position where the stacking effect begins as a percentage of viewport height."
        },
        {
          "nome": "scaleEndPosition",
          "tipo": "string",
          "padrao": "\"10%\"",
          "descricao": "Position where the scaling effect ends as a percentage of viewport height."
        },
        {
          "nome": "baseScale",
          "tipo": "number",
          "padrao": "0.85",
          "descricao": "Base scale value for the first item in the stack."
        },
        {
          "nome": "scaleDuration",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Duration of the scaling animation in seconds."
        },
        {
          "nome": "rotationAmount",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Rotation amount for each item in degrees."
        },
        {
          "nome": "blurAmount",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Blur amount for items that are further back in the stack."
        },
        {
          "nome": "useWindowScroll",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Whether to use window scroll for the stack."
        },
        {
          "nome": "onStackComplete",
          "tipo": "function",
          "padrao": "undefined",
          "descricao": "Callback function called when the stack animation is complete."
        }
      ],
      "totalProps": 13,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 266,
      "keywords": [
        "scroll",
        "stack",
        "component",
        "lenis",
        "children",
        "classname",
        "itemdistance",
        "itemscale",
        "itemstackdistance",
        "stackposition",
        "scaleendposition",
        "basescale",
        "scaleduration",
        "rotationamount",
        "bluramount",
        "usewindowscroll"
      ],
      "caminhoOrigem": "Components Animations\\Scroll Stack.txt"
    },
    {
      "id": "shape_bluer",
      "nome": "ShapeBlur",
      "arquivo": "Shape Bluer",
      "categoria": "component",
      "estilo": "geometrico",
      "dependencias": [
        "three"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "variation",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Selects the shape variation (0-3) used by the shader."
        },
        {
          "nome": "pixelRatioProp",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Overrides the pixel ratio, typically set to the device pixel ratio."
        },
        {
          "nome": "shapeSize",
          "tipo": "number",
          "padrao": "1.2",
          "descricao": "Controls the size of the shape."
        },
        {
          "nome": "roundness",
          "tipo": "number",
          "padrao": "0.4",
          "descricao": "Determines the roundness of the shape's corners."
        },
        {
          "nome": "borderSize",
          "tipo": "number",
          "padrao": "0.05",
          "descricao": "Sets the thickness of the border."
        },
        {
          "nome": "circleSize",
          "tipo": "number",
          "padrao": "0.3",
          "descricao": "Determines the size of the hover circle effect."
        },
        {
          "nome": "circleEdge",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Controls the edge softness of the hover circle."
        }
      ],
      "totalProps": 7,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 259,
      "keywords": [
        "shape",
        "blur",
        "bluer",
        "component",
        "three",
        "variation",
        "pixelratioprop",
        "shapesize",
        "roundness",
        "bordersize",
        "circlesize",
        "circleedge"
      ],
      "caminhoOrigem": "Components Animations\\Shape Bluer.txt"
    },
    {
      "id": "shape_grid",
      "nome": "ShapeGrid",
      "arquivo": "Shape Grid",
      "categoria": "background",
      "estilo": "geometrico",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "direction",
          "tipo": "string",
          "padrao": "'right'",
          "descricao": "Direction of square animation. Options: 'diagonal', 'up', 'right', 'down', 'left'."
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Animation speed multiplier."
        },
        {
          "nome": "borderColor",
          "tipo": "string",
          "padrao": "'#999'",
          "descricao": "Color of the square borders."
        },
        {
          "nome": "squareSize",
          "tipo": "number",
          "padrao": "40",
          "descricao": "Size of individual squares in pixels."
        },
        {
          "nome": "hoverFillColor",
          "tipo": "string",
          "padrao": "'#222'",
          "descricao": "Fill color when hovering over squares."
        },
        {
          "nome": "shape",
          "tipo": "string",
          "padrao": "'square'",
          "descricao": "Shape of the grid tiles. Options: 'square', 'hexagon', 'circle', 'triangle'."
        },
        {
          "nome": "hoverTrailAmount",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Number of previously hovered shapes to keep visible as a fading trail. 0 disables the trail."
        }
      ],
      "totalProps": 7,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 390,
      "keywords": [
        "shape",
        "grid",
        "background",
        "direction",
        "speed",
        "bordercolor",
        "squaresize",
        "hoverfillcolor",
        "hovertrailamount"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Shape Grid.txt"
    },
    {
      "id": "side_rays",
      "nome": "SideRays",
      "arquivo": "Side Rays",
      "categoria": "background",
      "estilo": "luz",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Animation speed of the rays"
        },
        {
          "nome": "rayColor1",
          "tipo": "string",
          "padrao": "\"#ffaa6e\"",
          "descricao": "Color of the first ray layer in hex format"
        },
        {
          "nome": "rayColor2",
          "tipo": "string",
          "padrao": "\"#96c8ff\"",
          "descricao": "Color of the second ray layer in hex format"
        },
        {
          "nome": "intensity",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Overall brightness of the rays"
        },
        {
          "nome": "spread",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Angular width of the ray fan — higher values create a wider spread between the two ray layers"
        },
        {
          "nome": "origin",
          "tipo": "\"top-right\"",
          "padrao": "\"top-left\"",
          "descricao": "\"bottom-right\""
        },
        {
          "nome": "tilt",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Rotation of the ray fan in degrees — positive values tilt clockwise"
        },
        {
          "nome": "saturation",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Color saturation of the rays — 0 renders in grayscale, values above 1 boost color"
        },
        {
          "nome": "blend",
          "tipo": "number",
          "padrao": "0.78",
          "descricao": "Balance between the two ray layers — 0 is all ray 1, 1 is all ray 2"
        },
        {
          "nome": "falloff",
          "tipo": "number",
          "padrao": "2.0",
          "descricao": "How steeply brightness diminishes with distance from the source — higher = tighter glow"
        },
        {
          "nome": "opacity",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Overall opacity of the effect"
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "\"\"",
          "descricao": "Additional CSS classes to apply to the container"
        }
      ],
      "totalProps": 12,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 261,
      "keywords": [
        "side",
        "rays",
        "background",
        "ogl",
        "speed",
        "raycolor1",
        "raycolor2",
        "intensity",
        "spread",
        "origin",
        "tilt",
        "saturation",
        "blend",
        "falloff",
        "opacity",
        "classname"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Side Rays.txt"
    },
    {
      "id": "silk",
      "nome": "Silk",
      "arquivo": "Silk",
      "categoria": "background",
      "estilo": "fluido",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "5",
          "descricao": "Controls the animation speed of the silk effect."
        },
        {
          "nome": "scale",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Controls the scale of the silk pattern."
        },
        {
          "nome": "color",
          "tipo": "string",
          "padrao": "'#7B7481'",
          "descricao": "Hex color code for the silk pattern."
        },
        {
          "nome": "noiseIntensity",
          "tipo": "number",
          "padrao": "1.5",
          "descricao": "Controls the intensity of the noise effect."
        },
        {
          "nome": "rotation",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Controls the rotation of the silk pattern (in radians)."
        }
      ],
      "totalProps": 5,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 119,
      "keywords": [
        "silk",
        "background",
        "speed",
        "scale",
        "color",
        "noiseintensity",
        "rotation"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Silk.txt"
    },
    {
      "id": "slpash_cursor",
      "nome": "SplashCursor",
      "arquivo": "Slpash Cursor",
      "categoria": "component",
      "estilo": "cursor",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "SIM_RESOLUTION",
          "tipo": "number",
          "padrao": "128",
          "descricao": "Fluid simulation resolution for velocity fields."
        },
        {
          "nome": "DYE_RESOLUTION",
          "tipo": "number",
          "padrao": "1440",
          "descricao": "Resolution of the color/dye texture."
        },
        {
          "nome": "CAPTURE_RESOLUTION",
          "tipo": "number",
          "padrao": "512",
          "descricao": "Resolution used for certain capture operations (rarely changed)."
        },
        {
          "nome": "DENSITY_DISSIPATION",
          "tipo": "number",
          "padrao": "3.5",
          "descricao": "Rate at which color/density dissipates over time."
        },
        {
          "nome": "VELOCITY_DISSIPATION",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Rate at which velocity dissipates over time."
        },
        {
          "nome": "PRESSURE",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "Base pressure for the fluid simulation."
        },
        {
          "nome": "PRESSURE_ITERATIONS",
          "tipo": "number",
          "padrao": "20",
          "descricao": "Number of Jacobi iterations used for the pressure solver."
        },
        {
          "nome": "CURL",
          "tipo": "number",
          "padrao": "3",
          "descricao": "Amount of vorticity/curl to apply for swirling effects."
        },
        {
          "nome": "SPLAT_RADIUS",
          "tipo": "number",
          "padrao": "0.2",
          "descricao": "Radius of the 'splat' effect when user interacts."
        },
        {
          "nome": "SPLAT_FORCE",
          "tipo": "number",
          "padrao": "6000",
          "descricao": "Force of the fluid 'splat' on each interaction."
        },
        {
          "nome": "SHADING",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Toggles simple lighting/shading on the fluid."
        },
        {
          "nome": "COLOR_UPDATE_SPEED",
          "tipo": "number",
          "padrao": "10",
          "descricao": "Frequency at which pointer colors are re-randomized."
        },
        {
          "nome": "RAINBOW_MODE",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "When true, uses randomly cycling rainbow colors. When false, uses the COLOR prop."
        },
        {
          "nome": "COLOR",
          "tipo": "string",
          "padrao": "'#ff0000'",
          "descricao": "Hex color for the cursor effect when RAINBOW_MODE is false."
        },
        {
          "nome": "BACK_COLOR",
          "tipo": "object",
          "padrao": "{ r: 0.5, g: 0, b: 0 }",
          "descricao": "Base background color for the fluid. Not always used if TRANSPARENT is true."
        }
      ],
      "totalProps": 15,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 1089,
      "keywords": [
        "splash",
        "cursor",
        "slpash",
        "component",
        "sim_resolution",
        "dye_resolution",
        "capture_resolution",
        "density_dissipation",
        "velocity_dissipation",
        "pressure",
        "pressure_iterations",
        "curl",
        "splat_radius",
        "splat_force",
        "shading",
        "color_update_speed"
      ],
      "caminhoOrigem": "Components Animations\\Slpash Cursor.txt"
    },
    {
      "id": "soft_aurora",
      "nome": "SoftAurora",
      "arquivo": "Soft Aurora",
      "categoria": "background",
      "estilo": "fluido",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "0.6",
          "descricao": "Overall animation speed multiplier."
        },
        {
          "nome": "scale",
          "tipo": "number",
          "padrao": "1.5",
          "descricao": "Scale of the noise pattern."
        },
        {
          "nome": "brightness",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Overall brightness multiplier."
        },
        {
          "nome": "color1",
          "tipo": "string",
          "padrao": "\"#f7f7f7\"",
          "descricao": "Tint color for the first aurora layer."
        },
        {
          "nome": "color2",
          "tipo": "string",
          "padrao": "\"#e100ff\"",
          "descricao": "Tint color for the second aurora layer."
        },
        {
          "nome": "noiseFrequency",
          "tipo": "number",
          "padrao": "2.5",
          "descricao": "Base frequency of the Perlin noise."
        },
        {
          "nome": "noiseAmplitude",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Base amplitude of the Perlin noise."
        },
        {
          "nome": "bandHeight",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "Vertical position of the aurora band (0-1)."
        },
        {
          "nome": "bandSpread",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Vertical spread of the aurora glow."
        },
        {
          "nome": "octaveDecay",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "Amplitude decay per noise octave."
        },
        {
          "nome": "layerOffset",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Time offset between the two aurora layers."
        },
        {
          "nome": "colorSpeed",
          "tipo": "number",
          "padrao": "1.0",
          "descricao": "Speed of palette color shifting."
        },
        {
          "nome": "enableMouseInteraction",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enable cursor-reactive aurora offset."
        },
        {
          "nome": "mouseInfluence",
          "tipo": "number",
          "padrao": "0.25",
          "descricao": "Strength of the mouse offset effect."
        }
      ],
      "totalProps": 14,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 267,
      "keywords": [
        "soft",
        "aurora",
        "background",
        "ogl",
        "speed",
        "scale",
        "brightness",
        "color1",
        "color2",
        "noisefrequency",
        "noiseamplitude",
        "bandheight",
        "bandspread",
        "octavedecay",
        "layeroffset",
        "colorspeed"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Soft Aurora.txt"
    },
    {
      "id": "specular_button",
      "nome": "StarBorder",
      "arquivo": "Specular Button",
      "categoria": "component",
      "estilo": "superficie",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "as",
          "tipo": "string",
          "padrao": "button",
          "descricao": "Allows specifying the type of the parent component to be rendered."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "-",
          "descricao": "Allows adding custom classes to the component."
        },
        {
          "nome": "color",
          "tipo": "string",
          "padrao": "white",
          "descricao": "Changes the main color of the border (fades to transparent)"
        },
        {
          "nome": "speed",
          "tipo": "string",
          "padrao": "6s",
          "descricao": "Changes the speed of the animation."
        },
        {
          "nome": "thickness",
          "tipo": "number",
          "padrao": "3",
          "descricao": "Controls the thickness of the star border effect."
        }
      ],
      "totalProps": 5,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 43,
      "keywords": [
        "star",
        "border",
        "specular",
        "button",
        "component",
        "classname",
        "color",
        "speed",
        "thickness"
      ],
      "caminhoOrigem": "Components Animations\\Specular Button.txt"
    },
    {
      "id": "spotligh_card",
      "nome": "SpotlightCard",
      "arquivo": "Spotligh Card",
      "categoria": "component",
      "estilo": "card",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "spotlightColor",
          "tipo": "string",
          "padrao": "rgba(255, 255, 255, 0.25)",
          "descricao": "Controls the color of the radial gradient used for the spotlight effect."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "—",
          "descricao": "Allows adding custom classes to the component."
        }
      ],
      "totalProps": 2,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 27,
      "keywords": [
        "spotlight",
        "card",
        "spotligh",
        "component",
        "spotlightcolor",
        "classname"
      ],
      "caminhoOrigem": "Components Animations\\Spotligh Card.txt"
    },
    {
      "id": "stack",
      "nome": "Stack",
      "arquivo": "Stack",
      "categoria": "component",
      "estilo": "card",
      "dependencias": [
        "motion"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "randomRotation",
          "tipo": "boolean",
          "padrao": "—",
          "descricao": "Applies a random rotation to each card for a 'messy' look."
        },
        {
          "nome": "sensitivity",
          "tipo": "number",
          "padrao": "200",
          "descricao": "Drag sensitivity for sending a card to the back."
        },
        {
          "nome": "sendToBackOnClick",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "When enabled, the stack also shifts to the next card on click."
        },
        {
          "nome": "cards",
          "tipo": "ReactNode[]",
          "padrao": "[]",
          "descricao": "The array of card elements to display in the stack."
        },
        {
          "nome": "animationConfig",
          "tipo": "object",
          "padrao": "{ stiffness: 260, damping: 20 }",
          "descricao": "Configures the spring animation's stiffness and damping."
        },
        {
          "nome": "autoplay",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "When enabled, the stack automatically cycles through cards."
        },
        {
          "nome": "autoplayDelay",
          "tipo": "number",
          "padrao": "3000",
          "descricao": "Delay in milliseconds between automatic card transitions."
        },
        {
          "nome": "pauseOnHover",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "When enabled, autoplay pauses when hovering over the stack."
        }
      ],
      "totalProps": 8,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 167,
      "keywords": [
        "stack",
        "component",
        "motion",
        "randomrotation",
        "sensitivity",
        "sendtobackonclick",
        "cards",
        "animationconfig",
        "autoplay",
        "autoplaydelay",
        "pauseonhover"
      ],
      "caminhoOrigem": "Components Animations\\Stack.txt"
    },
    {
      "id": "staggered_menu",
      "nome": "StaggeredMenu",
      "arquivo": "Staggered Menu",
      "categoria": "component",
      "estilo": "navegacao",
      "dependencias": [
        "gsap"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "position",
          "tipo": "\"left\"",
          "padrao": "\"right\"",
          "descricao": "\"right\""
        },
        {
          "nome": "colors",
          "tipo": "string[]",
          "padrao": "[\"#B497CF\", \"#5227FF\"]",
          "descricao": "Colors used for staggered underlay layers."
        },
        {
          "nome": "items",
          "tipo": "StaggeredMenuItem[]",
          "padrao": "[]",
          "descricao": "Menu items rendered inside the panel."
        },
        {
          "nome": "socialItems",
          "tipo": "StaggeredMenuSocialItem[]",
          "padrao": "[]",
          "descricao": "Social links displayed in the menu panel."
        },
        {
          "nome": "displaySocials",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Whether to display the social links section."
        },
        {
          "nome": "displayItemNumbering",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Whether to show numbering for menu items."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "undefined",
          "descricao": "Optional extra class names."
        },
        {
          "nome": "logoUrl",
          "tipo": "string",
          "padrao": "—",
          "descricao": "Path to the logo image."
        },
        {
          "nome": "menuButtonColor",
          "tipo": "string",
          "padrao": "\"#fff\"",
          "descricao": "Color of the menu toggle button when closed."
        },
        {
          "nome": "openMenuButtonColor",
          "tipo": "string",
          "padrao": "\"#fff\"",
          "descricao": "Color of the menu toggle button when open."
        },
        {
          "nome": "accentColor",
          "tipo": "string",
          "padrao": "undefined",
          "descricao": "Hover accent color for menu items."
        },
        {
          "nome": "changeMenuColorOnOpen",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Whether to animate the button color when opening/closing."
        },
        {
          "nome": "onMenuOpen",
          "tipo": "() => void",
          "padrao": "undefined",
          "descricao": "Callback function called when menu opens."
        },
        {
          "nome": "onMenuClose",
          "tipo": "() => void",
          "padrao": "undefined",
          "descricao": "Callback function called when menu closes."
        },
        {
          "nome": "closeOnClickAway",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Whether to close the menu when clicking outside."
        }
      ],
      "totalProps": 15,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 449,
      "keywords": [
        "staggered",
        "menu",
        "component",
        "gsap",
        "position",
        "colors",
        "items",
        "socialitems",
        "displaysocials",
        "displayitemnumbering",
        "classname",
        "logourl",
        "menubuttoncolor",
        "openmenubuttoncolor",
        "accentcolor",
        "changemenucoloronopen"
      ],
      "caminhoOrigem": "Components Animations\\Staggered Menu.txt"
    },
    {
      "id": "star_border",
      "nome": "StarBorder",
      "arquivo": "Star Border",
      "categoria": "component",
      "estilo": "particulas",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "as",
          "tipo": "string",
          "padrao": "button",
          "descricao": "Allows specifying the type of the parent component to be rendered."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "-",
          "descricao": "Allows adding custom classes to the component."
        },
        {
          "nome": "color",
          "tipo": "string",
          "padrao": "white",
          "descricao": "Changes the main color of the border (fades to transparent)"
        },
        {
          "nome": "speed",
          "tipo": "string",
          "padrao": "6s",
          "descricao": "Changes the speed of the animation."
        },
        {
          "nome": "thickness",
          "tipo": "number",
          "padrao": "3",
          "descricao": "Controls the thickness of the star border effect."
        }
      ],
      "totalProps": 5,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 43,
      "keywords": [
        "star",
        "border",
        "component",
        "classname",
        "color",
        "speed",
        "thickness"
      ],
      "caminhoOrigem": "Components Animations\\Star Border.txt"
    },
    {
      "id": "sticker_peel",
      "nome": "StickerPeel",
      "arquivo": "Sticker Peel",
      "categoria": "component",
      "estilo": "diverso",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "imageSrc",
          "tipo": "string",
          "padrao": "required",
          "descricao": "The source URL for the sticker image"
        },
        {
          "nome": "rotate",
          "tipo": "number",
          "padrao": "30",
          "descricao": "The rotation angle in degrees when dragging"
        },
        {
          "nome": "peelBackHoverPct",
          "tipo": "number",
          "padrao": "30",
          "descricao": "Percentage of peel effect on hover (0-100)"
        },
        {
          "nome": "peelBackActivePct",
          "tipo": "number",
          "padrao": "40",
          "descricao": "Percentage of peel effect when active/clicked (0-100)"
        },
        {
          "nome": "peelDirection",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Direction of the peel effect in degrees (0-360)"
        },
        {
          "nome": "peelEasing",
          "tipo": "string",
          "padrao": "power3.out",
          "descricao": "GSAP easing function for peel animations"
        },
        {
          "nome": "peelHoverEasing",
          "tipo": "string",
          "padrao": "power2.out",
          "descricao": "GSAP easing function for hover transitions"
        },
        {
          "nome": "width",
          "tipo": "number",
          "padrao": "200",
          "descricao": "Width of the sticker in pixels"
        },
        {
          "nome": "shadowIntensity",
          "tipo": "number",
          "padrao": "0.6",
          "descricao": "Intensity of the shadow effect (0-1)"
        },
        {
          "nome": "lightingIntensity",
          "tipo": "number",
          "padrao": "0.1",
          "descricao": "Intensity of the lighting effect (0-1)"
        },
        {
          "nome": "initialPosition",
          "tipo": "string",
          "padrao": "center",
          "descricao": "Initial position of the sticker ('center', 'top-left', 'top-right', 'bottom-left', 'bottom-right')"
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "—",
          "descricao": "Custom class name for additional styling"
        }
      ],
      "totalProps": 12,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 265,
      "keywords": [
        "sticker",
        "peel",
        "component",
        "imagesrc",
        "rotate",
        "peelbackhoverpct",
        "peelbackactivepct",
        "peeldirection",
        "peeleasing",
        "peelhovereasing",
        "width",
        "shadowintensity",
        "lightingintensity",
        "initialposition",
        "classname"
      ],
      "caminhoOrigem": "Components Animations\\Sticker Peel.txt"
    },
    {
      "id": "strands",
      "nome": "Strands",
      "arquivo": "Strands",
      "categoria": "component",
      "estilo": "diverso",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "colors",
          "tipo": "string[]",
          "padrao": "[\"#FF4242\", \"#7C3AED\", \"#06B6D4\", \"#EAB308\"]",
          "descricao": "Palette of hex colors cycled across the strands. Pass an empty array to use the built-in rainbow spectrum."
        },
        {
          "nome": "count",
          "tipo": "number",
          "padrao": "3",
          "descricao": "Number of strands woven through the animation."
        },
        {
          "nome": "speed",
          "tipo": "number",
          "padrao": "0.5",
          "descricao": "How quickly the strands ripple and flow."
        },
        {
          "nome": "amplitude",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Vertical reach of each strand as it waves up and down."
        },
        {
          "nome": "waviness",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Density of the curves along each strand."
        },
        {
          "nome": "thickness",
          "tipo": "number",
          "padrao": "0.7",
          "descricao": "Width of each glowing strand."
        },
        {
          "nome": "glow",
          "tipo": "number",
          "padrao": "2.6",
          "descricao": "Strength of the luminous bloom around the strands."
        },
        {
          "nome": "taper",
          "tipo": "number",
          "padrao": "3",
          "descricao": "How sharply the strands fade out toward the edges."
        },
        {
          "nome": "spread",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Separation between strands so they fan out instead of overlapping."
        },
        {
          "nome": "hueShift",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Rotates the colors around the strands for variation."
        },
        {
          "nome": "intensity",
          "tipo": "number",
          "padrao": "0.6",
          "descricao": "Overall brightness and energy of the effect."
        },
        {
          "nome": "saturation",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Vibrance of the colors. Above 1 makes them more intense, below 1 fades to grayscale."
        },
        {
          "nome": "opacity",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Overall transparency of the rendered strands."
        },
        {
          "nome": "scale",
          "tipo": "number",
          "padrao": "1",
          "descricao": ""
        }
      ],
      "totalProps": 14,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 358,
      "keywords": [
        "strands",
        "component",
        "ogl",
        "colors",
        "count",
        "speed",
        "amplitude",
        "waviness",
        "thickness",
        "glow",
        "taper",
        "spread",
        "hueshift",
        "intensity",
        "saturation"
      ],
      "caminhoOrigem": "Components Animations\\Strands.txt"
    },
    {
      "id": "target_cursor",
      "nome": "TargetCursor",
      "arquivo": "Target Cursor",
      "categoria": "component",
      "estilo": "cursor",
      "dependencias": [
        "gsap"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "targetSelector",
          "tipo": "string",
          "padrao": "\".cursor-target\"",
          "descricao": "CSS selector for elements that should trigger the cursor targeting effect"
        },
        {
          "nome": "spinDuration",
          "tipo": "number",
          "padrao": "2",
          "descricao": "Duration in seconds for the cursor's spinning animation when not targeting"
        },
        {
          "nome": "hideDefaultCursor",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Whether to hide the default browser cursor when the component is active"
        },
        {
          "nome": "hoverDuration",
          "tipo": "number",
          "padrao": "0.2",
          "descricao": "Duration in seconds for the transition when the cursor locks onto a target"
        },
        {
          "nome": "parallaxOn",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Enables a subtle parallax effect on the corners when moving over a target"
        },
        {
          "nome": "cursorColor",
          "tipo": "string",
          "padrao": "'#ffffff'",
          "descricao": "Color of the cursor dot and corner brackets at rest"
        },
        {
          "nome": "cursorColorOnTarget",
          "tipo": "string",
          "padrao": "undefined",
          "descricao": "Optional color the cursor smoothly transitions to while locked onto a target"
        }
      ],
      "totalProps": 7,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 419,
      "keywords": [
        "target",
        "cursor",
        "component",
        "gsap",
        "targetselector",
        "spinduration",
        "hidedefaultcursor",
        "hoverduration",
        "parallaxon",
        "cursorcolor",
        "cursorcolorontarget"
      ],
      "caminhoOrigem": "Components Animations\\Target Cursor.txt"
    },
    {
      "id": "threads",
      "nome": "Threads",
      "arquivo": "Threads",
      "categoria": "background",
      "estilo": "fluido",
      "dependencias": [
        "ogl"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "color",
          "tipo": "[number, number, number]",
          "padrao": "[1, 1, 1]",
          "descricao": "Customizes the color of the lines (RGB)."
        },
        {
          "nome": "amplitude",
          "tipo": "number",
          "padrao": "1",
          "descricao": "Adjusts the intensity of the wave effect on the lines."
        },
        {
          "nome": "distance",
          "tipo": "number",
          "padrao": "0",
          "descricao": "Controls the spacing between the lines. A value of 0 means no offset."
        },
        {
          "nome": "enableMouseInteraction",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Enables smooth mouse hover effects that modulate the line's movement and amplitude."
        }
      ],
      "totalProps": 4,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 253,
      "keywords": [
        "threads",
        "background",
        "ogl",
        "color",
        "amplitude",
        "distance",
        "enablemouseinteraction"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Threads.txt"
    },
    {
      "id": "tilted_card",
      "nome": "TiltedCard",
      "arquivo": "Tilted Card",
      "categoria": "component",
      "estilo": "card",
      "dependencias": [
        "motion"
      ],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "imageSrc",
          "tipo": "string",
          "padrao": "N/A",
          "descricao": "The source URL of the image."
        },
        {
          "nome": "altText",
          "tipo": "string",
          "padrao": "Tilted card image",
          "descricao": "Alternative text for the image."
        },
        {
          "nome": "captionText",
          "tipo": "string",
          "padrao": "—",
          "descricao": "Text for the tooltip caption."
        },
        {
          "nome": "containerHeight",
          "tipo": "string",
          "padrao": "600px",
          "descricao": "Height of the overall card container."
        },
        {
          "nome": "containerWidth",
          "tipo": "string",
          "padrao": "100%",
          "descricao": "Width of the overall card container."
        },
        {
          "nome": "imageHeight",
          "tipo": "string",
          "padrao": "300px",
          "descricao": "Height of the inner image."
        },
        {
          "nome": "imageWidth",
          "tipo": "string",
          "padrao": "300px",
          "descricao": "Width of the inner image."
        },
        {
          "nome": "scaleOnHover",
          "tipo": "number",
          "padrao": "1.1",
          "descricao": "Scaling factor applied on hover."
        },
        {
          "nome": "rotateAmplitude",
          "tipo": "number",
          "padrao": "14",
          "descricao": "Controls how much the card tilts with mouse movement."
        },
        {
          "nome": "showMobileWarning",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Whether to show a small alert about mobile usage."
        },
        {
          "nome": "showTooltip",
          "tipo": "boolean",
          "padrao": "true",
          "descricao": "Toggles the visibility of the tooltip (figcaption)."
        },
        {
          "nome": "displayOverlayContent",
          "tipo": "boolean",
          "padrao": "false",
          "descricao": "Whether to display any overlayContent on top of the image."
        },
        {
          "nome": "overlayContent",
          "tipo": "ReactNode",
          "padrao": "null",
          "descricao": "A React node to display as an overlay on the card."
        }
      ],
      "totalProps": 13,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 135,
      "keywords": [
        "tilted",
        "card",
        "component",
        "motion",
        "imagesrc",
        "alttext",
        "captiontext",
        "containerheight",
        "containerwidth",
        "imageheight",
        "imagewidth",
        "scaleonhover",
        "rotateamplitude",
        "showmobilewarning",
        "showtooltip",
        "displayoverlaycontent"
      ],
      "caminhoOrigem": "Components Animations\\Tilted Card.txt"
    },
    {
      "id": "waves",
      "nome": "Waves",
      "arquivo": "Waves",
      "categoria": "background",
      "estilo": "fluido",
      "dependencias": [],
      "dependenciasFaltando": [],
      "instalavel": true,
      "props": [
        {
          "nome": "lineColor",
          "tipo": "string",
          "padrao": "black",
          "descricao": "Defines the color of the wave lines drawn on the canvas."
        },
        {
          "nome": "backgroundColor",
          "tipo": "string",
          "padrao": "transparent",
          "descricao": "Sets the background color of the waves container."
        },
        {
          "nome": "waveSpeedX",
          "tipo": "number",
          "padrao": "0.0125",
          "descricao": "Horizontal speed factor for the wave animation."
        },
        {
          "nome": "waveSpeedY",
          "tipo": "number",
          "padrao": "0.005",
          "descricao": "Vertical speed factor for the wave animation."
        },
        {
          "nome": "waveAmpX",
          "tipo": "number",
          "padrao": "32",
          "descricao": "Horizontal amplitude of each wave."
        },
        {
          "nome": "waveAmpY",
          "tipo": "number",
          "padrao": "16",
          "descricao": "Vertical amplitude of each wave."
        },
        {
          "nome": "xGap",
          "tipo": "number",
          "padrao": "10",
          "descricao": "Horizontal gap between individual wave lines."
        },
        {
          "nome": "yGap",
          "tipo": "number",
          "padrao": "32",
          "descricao": "Vertical gap between points on each wave line."
        },
        {
          "nome": "friction",
          "tipo": "number",
          "padrao": "0.925",
          "descricao": "Controls how quickly the cursor effect slows down."
        },
        {
          "nome": "tension",
          "tipo": "number",
          "padrao": "0.005",
          "descricao": "Determines the 'springiness' of the cursor effect on points."
        },
        {
          "nome": "maxCursorMove",
          "tipo": "number",
          "padrao": "100",
          "descricao": "Limits how far each point can shift due to cursor movement."
        },
        {
          "nome": "style",
          "tipo": "object",
          "padrao": "{}",
          "descricao": "Inline styles applied to the container element."
        },
        {
          "nome": "className",
          "tipo": "string",
          "padrao": "—",
          "descricao": "Custom class name(s) applied to the container element."
        }
      ],
      "totalProps": 13,
      "usageExample": "",
      "temFonte": true,
      "linhasFonte": 324,
      "keywords": [
        "waves",
        "background",
        "linecolor",
        "backgroundcolor",
        "wavespeedx",
        "wavespeedy",
        "waveampx",
        "waveampy",
        "xgap",
        "ygap",
        "friction",
        "tension",
        "maxcursormove",
        "style"
      ],
      "caminhoOrigem": "Backgrounds Animations\\Waves.txt"
    }
  ]
};

export default COMPONENT_INDEX;

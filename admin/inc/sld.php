<?php
/**
 * Generador de SLD 1.0.0 a partir de presets simples.
 * Tipos: 'poly-outline' (solo contorno), 'poly-fill' (relleno+borde),
 *        'line', 'point'.
 */
declare(strict_types=1);

function sld_color_ok(string $c): string {
    return preg_match('/^#[0-9a-fA-F]{6}$/', $c) ? $c : '#1e73be';
}

function sld_generate(string $styleName, string $type, string $color, float $width = 2.0): string {
    $color = sld_color_ok($color);
    $name  = htmlspecialchars($styleName, ENT_QUOTES, 'UTF-8');
    $w     = number_format($width, 1, '.', '');

    switch ($type) {
        case 'poly-outline':
            $sym = "<PolygonSymbolizer>
            <Stroke>
              <CssParameter name=\"stroke\">$color</CssParameter>
              <CssParameter name=\"stroke-width\">$w</CssParameter>
            </Stroke>
          </PolygonSymbolizer>";
            break;
        case 'poly-fill':
            $sym = "<PolygonSymbolizer>
            <Fill>
              <CssParameter name=\"fill\">$color</CssParameter>
              <CssParameter name=\"fill-opacity\">0.45</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name=\"stroke\">$color</CssParameter>
              <CssParameter name=\"stroke-width\">$w</CssParameter>
            </Stroke>
          </PolygonSymbolizer>";
            break;
        case 'line':
            $sym = "<LineSymbolizer>
            <Stroke>
              <CssParameter name=\"stroke\">$color</CssParameter>
              <CssParameter name=\"stroke-width\">$w</CssParameter>
            </Stroke>
          </LineSymbolizer>";
            break;
        case 'point':
        default:
            $sym = "<PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill><CssParameter name=\"fill\">$color</CssParameter></Fill>
                <Stroke>
                  <CssParameter name=\"stroke\">#ffffff</CssParameter>
                  <CssParameter name=\"stroke-width\">1</CssParameter>
                </Stroke>
              </Mark>
              <Size>8</Size>
            </Graphic>
          </PointSymbolizer>";
            break;
    }

    return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<StyledLayerDescriptor version=\"1.0.0\"
    xmlns=\"http://www.opengis.net/sld\"
    xmlns:ogc=\"http://www.opengis.net/ogc\"
    xmlns:xlink=\"http://www.w3.org/1999/xlink\"
    xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"
    xsi:schemaLocation=\"http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd\">
  <NamedLayer>
    <Name>$name</Name>
    <UserStyle>
      <Title>$name</Title>
      <FeatureTypeStyle>
        <Rule>
          $sym
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>";
}

/** Sugiere un tipo de estilo a partir del tipo de geometría PostGIS. */
function sld_suggest_type(string $geomType): string {
    $g = strtoupper($geomType);
    if (strpos($g, 'POLYGON') !== false) return 'poly-outline';
    if (strpos($g, 'LINE') !== false)    return 'line';
    return 'point';
}

/** Tipos de estilo aplicables según la geometría (id => etiqueta). */
function sld_allowed_types(string $geomType): array {
    $g = strtoupper($geomType);
    if (strpos($g, 'POLYGON') !== false) {
        return ['poly-outline' => 'Polígono — solo contorno', 'poly-fill' => 'Polígono — relleno + borde'];
    }
    if (strpos($g, 'LINE') !== false)  return ['line' => 'Línea'];
    if (strpos($g, 'POINT') !== false) return ['point' => 'Punto'];
    // Geometría desconocida: ofrecer todo.
    return ['poly-outline' => 'Polígono — solo contorno', 'poly-fill' => 'Polígono — relleno + borde', 'line' => 'Línea', 'point' => 'Punto'];
}

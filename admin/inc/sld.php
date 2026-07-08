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

/* ================= Traducción de renderers ArcGIS a SLD clasificado ================= */

/** Color ArcGIS [r,g,b,a] → ['hex'=>'#rrggbb','opacity'=>0..1]. */
function sld_arcgis_color($c, string $fallback = '#888888'): array {
    if (!is_array($c) || count($c) < 3) return ['hex' => $fallback, 'opacity' => 1.0];
    $r = max(0, min(255, (int)$c[0])); $g = max(0, min(255, (int)$c[1])); $b = max(0, min(255, (int)$c[2]));
    $a = isset($c[3]) ? max(0, min(255, (int)$c[3])) / 255 : 1.0;
    return ['hex' => sprintf('#%02x%02x%02x', $r, $g, $b), 'opacity' => round($a, 3)];
}

/** Symbolizer SLD para un símbolo ArcGIS, según el tipo de geometría PostGIS. */
function sld_symbolizer_from_arcgis($symbol, string $pgGeom): string {
    $symbol = is_array($symbol) ? $symbol : [];
    $g = strtoupper($pgGeom);
    if (strpos($g, 'POLYGON') !== false) {
        $fill = sld_arcgis_color($symbol['color'] ?? null, '#cccccc');
        $out  = sld_arcgis_color($symbol['outline']['color'] ?? null, '#333333');
        $ow   = number_format(((float)($symbol['outline']['width'] ?? 0.5)) ?: 0.5, 1, '.', '');
        return "<PolygonSymbolizer>
            <Fill><CssParameter name=\"fill\">{$fill['hex']}</CssParameter>"
            . "<CssParameter name=\"fill-opacity\">{$fill['opacity']}</CssParameter></Fill>
            <Stroke><CssParameter name=\"stroke\">{$out['hex']}</CssParameter>"
            . "<CssParameter name=\"stroke-width\">$ow</CssParameter></Stroke>
          </PolygonSymbolizer>";
    }
    if (strpos($g, 'LINE') !== false) {
        $col = sld_arcgis_color($symbol['color'] ?? null, '#333333');
        $w   = number_format(((float)($symbol['width'] ?? 1)) ?: 1, 1, '.', '');
        return "<LineSymbolizer>
            <Stroke><CssParameter name=\"stroke\">{$col['hex']}</CssParameter>"
            . "<CssParameter name=\"stroke-opacity\">{$col['opacity']}</CssParameter>"
            . "<CssParameter name=\"stroke-width\">$w</CssParameter></Stroke>
          </LineSymbolizer>";
    }
    $fill = sld_arcgis_color($symbol['color'] ?? null, '#1e73be');
    $sz   = number_format(((float)($symbol['size'] ?? 6)) ?: 6, 0);
    return "<PointSymbolizer><Graphic><Mark>
        <WellKnownName>circle</WellKnownName>
        <Fill><CssParameter name=\"fill\">{$fill['hex']}</CssParameter></Fill>
        <Stroke><CssParameter name=\"stroke\">#ffffff</CssParameter><CssParameter name=\"stroke-width\">0.6</CssParameter></Stroke>
      </Mark><Size>$sz</Size></Graphic></PointSymbolizer>";
}

/**
 * SLD clasificado desde un renderer ArcGIS (uniqueValue / classBreaks / simple).
 * Devuelve el SLD, o null si no hay clasificación traducible (el llamador usa estilo plano).
 * Los <Title> de cada regla generan la leyenda en GeoServer (GetLegendGraphic).
 */
function sld_from_arcgis_renderer(array $renderer, string $styleName, string $pgGeom, array $columns = [], array $presentValues = []): ?string {
    $type  = $renderer['type'] ?? '';
    $rules = '';
    // Si se pasan las categorías presentes en los datos, la leyenda se poda a esas
    // (evita mostrar categorías nacionales sin rasgos en el municipio, p. ej. refinerías).
    $present = $presentValues ? array_flip(array_map('strval', $presentValues)) : null;

    // Resuelve el nombre del campo al de la columna real en PostGIS: ogr2ogr suele
    // minusculizar (TIPO → tipo). Se busca sin distinguir mayúsculas; si no hay lista
    // de columnas, se cae a minúsculas (comportamiento por defecto del loader).
    $resolveField = function (string $f) use ($columns): string {
        foreach ($columns as $c) if (strcasecmp($c, $f) === 0) return $c;
        return strtolower($f);
    };

    if ($type === 'uniqueValue') {
        $field = (string)($renderer['field1'] ?? '');
        $infos = $renderer['uniqueValueInfos'] ?? [];
        if ($field === '' || !$infos) return null;
        $fieldX = htmlspecialchars($resolveField($field), ENT_QUOTES, 'UTF-8');
        foreach ($infos as $u) {
            $val   = (string)($u['value'] ?? '');
            if ($present !== null && !isset($present[$val])) continue;   // categoría sin rasgos en el municipio
            $valX  = htmlspecialchars($val, ENT_QUOTES, 'UTF-8');
            $label = htmlspecialchars((string)($u['label'] ?? $val), ENT_QUOTES, 'UTF-8');
            $sym   = sld_symbolizer_from_arcgis($u['symbol'] ?? null, $pgGeom);
            $rules .= "<Rule><Title>$label</Title>
              <ogc:Filter><ogc:PropertyIsEqualTo>
                <ogc:PropertyName>$fieldX</ogc:PropertyName><ogc:Literal>$valX</ogc:Literal>
              </ogc:PropertyIsEqualTo></ogc:Filter>
              $sym
            </Rule>";
        }
        if (!empty($renderer['defaultSymbol'])) {
            $rules .= "<Rule><Title>Otros</Title><ogc:ElseFilter/>"
                . sld_symbolizer_from_arcgis($renderer['defaultSymbol'], $pgGeom) . "</Rule>";
        }
    } elseif ($type === 'classBreaks') {
        $field = (string)($renderer['field'] ?? '');
        $infos = $renderer['classBreakInfos'] ?? [];
        if ($field === '' || !$infos) return null;
        $fieldX  = htmlspecialchars($resolveField($field), ENT_QUOTES, 'UTF-8');
        $prevMax = $renderer['minValue'] ?? null;
        foreach ($infos as $ci) {
            $max   = $ci['classMaxValue'] ?? null;
            $label = htmlspecialchars((string)($ci['label'] ?? ''), ENT_QUOTES, 'UTF-8');
            $sym   = sld_symbolizer_from_arcgis($ci['symbol'] ?? null, $pgGeom);
            $conds = [];
            if ($prevMax !== null) $conds[] = "<ogc:PropertyIsGreaterThan><ogc:PropertyName>$fieldX</ogc:PropertyName><ogc:Literal>" . (float)$prevMax . "</ogc:Literal></ogc:PropertyIsGreaterThan>";
            if ($max !== null)     $conds[] = "<ogc:PropertyIsLessThanOrEqualTo><ogc:PropertyName>$fieldX</ogc:PropertyName><ogc:Literal>" . (float)$max . "</ogc:Literal></ogc:PropertyIsLessThanOrEqualTo>";
            $filt = count($conds) === 2 ? '<ogc:Filter><ogc:And>' . implode('', $conds) . '</ogc:And></ogc:Filter>'
                  : (count($conds) === 1 ? '<ogc:Filter>' . $conds[0] . '</ogc:Filter>' : '');
            $rules  .= "<Rule><Title>$label</Title>$filt $sym</Rule>";
            $prevMax = $max;
        }
    } elseif ($type === 'simple') {
        $rules = "<Rule>" . sld_symbolizer_from_arcgis($renderer['symbol'] ?? null, $pgGeom) . "</Rule>";
    } else {
        return null;
    }

    if ($rules === '') return null;
    $name = htmlspecialchars($styleName, ENT_QUOTES, 'UTF-8');
    return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<StyledLayerDescriptor version=\"1.0.0\" xmlns=\"http://www.opengis.net/sld\" xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">
  <NamedLayer><Name>$name</Name><UserStyle><Title>$name</Title>
    <FeatureTypeStyle>$rules</FeatureTypeStyle>
  </UserStyle></NamedLayer>
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

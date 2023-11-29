<?php
/*
  Plugin Name:  Hydrogen Payment Gateway
  Plugin URI:   
  Description:  Hydrogen Payment Gateway helps you process payments using cards and account transfers for faster delivery of goods and services.
  Version:      1.0.0
  Author:       Hydrogen
  Author URI:   
*/
// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}
define('PG_HYDROGEN_PLUGIN_PATH', plugins_url(__FILE__));
define('PG_HYDROGEN_MAIN_FILE', __FILE__);
define('PG_HYDROGEN_VERSION', '1.0.0');
define('PG_HYDROGEN_TABLE', 'hydrogen_forms_payments');

define('PG_PLUGIN_BASENAME', plugin_basename(__FILE__));

// fix some badly enqueued scripts with no sense of HTTPS
add_action('wp_print_scripts', 'pg_hydrogen_enqueueScriptsFix', 100);
add_action('wp_print_styles', 'pg_hydrogen_enqueueStylesFix', 100);

/**
 * force plugins to load scripts with SSL if page is SSL
 */
function pg_hydrogen_enqueueScriptsFix()
{
    if (!is_admin()) {
        if (!empty($_SERVER['HTTPS']) && ($_SERVER['HTTPS'] != "off")) {
            global $wp_scripts;
            foreach ((array) $wp_scripts->registered as $script) {
                if (stripos($script->src, 'http://', 0) !== false) {
                    $script->src = str_replace('http://', 'https://', $script->src);
                }
            }
        }
    }
}

/**
 * force plugins to load styles with SSL if page is SSL
 */
function pg_hydrogen_enqueueStylesFix()
{
    if (!is_admin()) {
        if (!empty($_SERVER['HTTPS']) && ($_SERVER['HTTPS'] != "off")) {
            global $wp_styles;
            foreach ((array) $wp_styles->registered as $script) {
                if (stripos($script->src, 'http://', 0) !== false) {
                    $script->src = str_replace('http://', 'https://', $script->src);
                }
            }
        }
    }
}

function kkd_pff_tl_save_error()
{
    update_option('plugin_error',  ob_get_contents());
}
add_action('activated_plugin', 'kkd_pff_tl_save_error');
/* Then to display the error message: */
echo get_option('plugin_error');


function pg_hydrogen_activate_hydrogen_forms()
{
    include_once plugin_dir_path(__FILE__) . 'includes/class-hydrogen-forms-activator.php';
    pg_Hydrogen_Activator::activate();
}

register_activation_hook(__FILE__, 'pg_hydrogen_activate_hydrogen_forms');


require plugin_dir_path(__FILE__) . 'includes/class-hydrogen-forms.php';

function pg_hydrogen_run_hydrogen_forms()
{
    $plugin = new pg_Hydrogen();
    $plugin->run();
}
pg_hydrogen_run_hydrogen_forms();

function pg_hydrogen_shortcode_button_script()
{
    if (wp_script_is("quicktags")) {
        ?>
<script type="text/javascript">
//this function is used to retrieve the selected text from the text editor
function getSel() {
    var txtarea = document.getElementById("content");
    var start = txtarea.selectionStart;
    var finish = txtarea.selectionEnd;
    return txtarea.value.substring(start, finish);
}

QTags.addButton(
    "t_shortcode",
    "Insert Text",
    insertText
);

function insertText() {
    QTags.insertContent('[text name="Text Title"]');
}
QTags.addButton(
    "ta_shortcode",
    "Insert Textarea",
    insertTextarea
);

function insertTextarea() {
    QTags.insertContent('[textarea name="Text Title"]');
}
QTags.addButton(
    "s_shortcode",
    "Insert Select Dropdown",
    insertSelectb
);

function insertSelectb() {
    QTags.insertContent('[select name="Text Title" options="option 1,option 2,option 3"]');
}
QTags.addButton(
    "r_shortcode",
    "Insert Radio Options",
    insertRadiob
);

function insertRadiob() {
    QTags.insertContent('[radio name="Text Title" options="option 1,option 2,option 3"]');
}
QTags.addButton(
    "cb_shortcode",
    "Insert Checkbox Options",
    insertCheckboxb
);

function insertCheckboxb() {
    QTags.insertContent('[checkbox name="Text Title" options="option 1,option 2,option 3"]');
}
QTags.addButton(
    "dp_shortcode",
    "Insert Datepicker",
    insertDatepickerb
);

function insertDatepickerb() {
    QTags.insertContent('[datepicker name="Datepicker Title"]');
}
QTags.addButton(
    "i_shortcode",
    "Insert File Upload",
    insertInput
);

function insertInput() {
    QTags.insertContent('[input name="File Name"]');
}
QTags.addButton(
    "ngs_shortcode",
    "Insert Nigerian States",
    insertSelectStates
);

function insertSelectStates() {
    QTags.insertContent(
        '[select name="State" options="Abia,Adamawa,Akwa Ibom,Anambra,Bauchi,Bayelsa,Benue,Borno,Cross River,Delta,Ebonyi,Edo,Ekiti,Enugu,FCT,Gombe,Imo,Jigawa,Kaduna,Kano,Katsina,Kebbi,Kogi,Kwara,Lagos,Nasarawa,Niger,Ogun,Ondo,Osun,Oyo,Plateau,Rivers,Sokoto,Taraba,Yobe,Zamfara"]'
        );
}
QTags.addButton(
    "ctys_shortcode",
    "Insert All Countries",
    insertSelectCountries
);

function insertSelectCountries() {
    QTags.insertContent(
        '[select  name="country" options="Afghanistan, Albania, Algeria, American Samoa, Andorra, Angola, Anguilla, Antarctica, Antigua and Barbuda, Argentina, Armenia, Aruba, Australia, Austria, Azerbaijan, Bahamas, Bahrain, Bangladesh, Barbados, Belarus, Belgium, Belize, Benin, Bermuda, Bhutan, Bolivia, Bosnia and Herzegovina, Botswana, Bouvet Island, Brazil, British Indian Ocean Territory, Brunei Darussalam, Bulgaria, Burkina Faso, Burundi, Cambodia, Cameroon, Canada, Cape Verde, Cayman Islands, Central African Republic, Chad, Chile, China, Christmas Island, Cocos (Keeling) Islands, Colombia, Comoros, Congo, Congo, The Democratic Republic of The, Cook Islands, Costa Rica, Cote D’ivoire, Croatia, Cuba, Cyprus, Czech Republic, Denmark, Djibouti, Dominica, Dominican Republic, Ecuador, Egypt, El Salvador, Equatorial Guinea, Eritrea, Estonia, Ethiopia, Falkland Islands (Malvinas), Faroe Islands, Fiji, Finland, France, French Guiana, French Polynesia, French Southern Territories, Gabon, Gambia, Georgia, Germany, Ghana, Gibraltar, Greece, Greenland, Grenada, Guadeloupe, Guam, Guatemala, Guinea, Guinea-bissau, Guyana, Haiti, Heard Island and Mcdonald Islands, Holy See (Vatican City State), Honduras, Hong Kong, Hungary, Iceland, India, Indonesia, Iran, Islamic Republic of, Iraq, Ireland, Israel, Italy, Jamaica, Japan, Jordan, Kazakhstan, Kenya, Kiribati, Korea, Democratic People’s Republic of, Korea, Republic of, Kuwait, Kyrgyzstan, Lao People’s Democratic Republic, Latvia, Lebanon, Lesotho, Liberia, Libyan Arab Jamahiriya, Liechtenstein, Lithuania, Luxembourg, Macao, Macedonia, The Former Yugoslav Republic of, Madagascar, Malawi, Malaysia, Maldives, Mali, Malta, Marshall Islands, Martinique, Mauritania, Mauritius, Mayotte, Mexico, Micronesia, Federated States of, Moldova, Republic of, Monaco, Mongolia, Montserrat, Morocco, Mozambique, Myanmar, Namibia, Nauru, Nepal, Netherlands, Netherlands Antilles, New Caledonia, New Zealand, Nicaragua, Niger, Nigeria, Niue, Norfolk Island, Northern Mariana Islands, Norway, Oman, Pakistan, Palau, Palestinian Territory, Occupied, Panama, Papua New Guinea, Paraguay, Peru, Philippines, Pitcairn, Poland, Portugal, Puerto Rico, Qatar, Reunion, Romania, Russian Federation, Rwanda, Saint Helena, Saint Kitts and Nevis, Saint Lucia, Saint Pierre and Miquelon, Saint Vincent and The Grenadines, Samoa, San Marino, Sao Tome and Principe, Saudi Arabia, Senegal, Serbia and Montenegro, Seychelles, Sierra Leone, Singapore, Slovakia, Slovenia, Solomon Islands, Somalia, South Africa, South Georgia and The South Sandwich Islands, Spain, Sri Lanka, Sudan, Suriname, Svalbard and Jan Mayen, Swaziland, Sweden, Switzerland, Syrian Arab Republic, Taiwan, Province of China, Tajikistan, Tanzania, United Republic of, Thailand, Timor-leste, Togo, Tokelau, Tonga, Trinidad and Tobago, Tunisia, Turkey, Turkmenistan, Turks and Caicos Islands, Tuvalu, Uganda, Ukraine, United Arab Emirates, United Kingdom, United States, United States Minor Outlying Islands, Uruguay, Uzbekistan, Vanuatu, Venezuela, Viet Nam, Virgin Islands, British, Virgin Islands, U.S., Wallis and Futuna, Western Sahara, Yemen, Zambia, Zimbabwe"] '
        );
}

//
</script>
<?php
    }
}

add_action('init', 'kkd_pff_init');
function kkd_pff_init()
{
    add_rewrite_rule('^hydrogeninvoice$', 'index.php?kkd_pff_stats=true', 'top');
}

// But WordPress has a whitelist of variables it allows, so we must put it on that list
add_action('query_vars', 'kkd_pff_query_vars');
function kkd_pff_query_vars($query_vars)
{
    $query_vars[] = 'kkd_pff_stats';
    return $query_vars;
}

// If this is done, we can access it later
// This example checks very early in the process:
// if the variable is set, we include our page and stop execution after it
add_action('parse_request', 'kkd_pff_parse_request');
function kkd_pff_parse_request(&$wp)
{
    if (array_key_exists('kkd_pff_stats', $wp->query_vars)) {
        include dirname(__FILE__) . '/includes/hydrogen-invoice.php';
        exit();
    }
}

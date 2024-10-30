<?php
/**
 * Plugin Name: Calculator Blocks
 * Description: Calculator Blocks turns your Excel & Google Sheets into content. Personalize user results with forms and create mobile friendly visualizations.
 * Requires at least: 5.9
 * Tested up to: 6.3
 * Version: 1.0.2
 * Author: excelkits
 * Author URI: https://www.excelkits.com
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: excelkits-blocks
 *
 * @package excelkits-blocks
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define EXCELKITS_BLOCKS_PLUGIN_DIR.
if ( ! defined( 'EXCELKITS_BLOCKS_PLUGIN_DIR' ) ) {
	define( 'EXCELKITS_BLOCKS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
}

require_once EXCELKITS_BLOCKS_PLUGIN_DIR . 'src/class-excelkits-blocks-encryption.php';

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function excelkits_blocks_register_block_library() {
	$blocks = array( 'calculator/' );
	$api_key_utils = new Excelkits_Blocks_Encryption();
	$api_key_opt = get_option( 'api_key' );
	$secret_opt = get_option( 'secret' );
	$api_key = isset( $api_key_opt ) ? $api_key_opt : '';
	$secret = isset( $secret_opt ) ? $api_key_utils->decrypt( $secret_opt ) : '';

	foreach ( $blocks as $block ) {
		register_block_type(
			EXCELKITS_BLOCKS_PLUGIN_DIR . 'build/block-library/' . $block,
			array(
				'render_callback' => 'render_callback',
				'attributes'      => array(
					'apiKey' => array(
						'type'    => 'string',
						'default' => $api_key,
					),
					'secret'  => array(
						'type'    => 'string',
						'default' => $secret,
					),
					'isBlockInsertPreview' => array(
						'type'    => 'boolean',
						'default' => false,
					),
					'selected'    => array(
						'type'    => 'string',
						'default' => '',
					),
					'snippetHtml' => array(
						'type'    => 'string',
						'default' => '',
					),
				),
			)
		);
	}
}
add_filter( 'should_load_separate_core_block_assets', '__return_true' );
add_action( 'init', 'excelkits_blocks_register_block_library' );

/**
 * Register Plugin Settings
 */
function excelkits_blocks_plugin_register_settings() {
	register_setting(
		'excelkits_blocks_plugin_settings',
		'api_key',
		array(
			'default'       => '',
			'show_in_rest'  => true,
			'type'          => 'string',
		)
	);

	register_setting(
		'excelkits_blocks_plugin_settings',
		'secret',
		array(
			'default'       => '',
			'show_in_rest'  => true,
			'type'          => 'string',
		)
	);
}
add_action( 'init', 'excelkits_blocks_plugin_register_settings' );

/**
 * Setup Admin Menu
 */
if ( is_admin() ) {
	require_once EXCELKITS_BLOCKS_PLUGIN_DIR . 'excelkits-blocks-admin.php';
	add_action( 'admin_menu', 'excelkits_blocks_add_admin_page' );
}

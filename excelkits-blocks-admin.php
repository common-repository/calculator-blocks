<?php
/**
 * Create Excelkits admin menu
 *
 * @package excelkits-blocks
 */

/**
 * Setup the admin settings menu
 */
function excelkits_blocks_add_admin_page() {
	add_submenu_page(
		'options-general.php',
		'Excelkits',
		'Excelkits',
		'manage_options',
		'excelkits',
		'excelkits_blocks_api_key_form'
	);
}

/**
 * Render the Admin API Key Form
 */
function excelkits_blocks_api_key_form() {
	$api_key_utils = new Excelkits_Blocks_Encryption();
	$api_key = '';
	$secret = '';
	$has_requested_save = false;
	$has_successfully_saved = true;
	$nonce = isset( $_REQUEST['_wpnonce'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) ) : '';
	$req_action = isset( $_REQUEST['action'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['action'] ) ) : '';
	$is_delete = 'delete' === $req_action;
	$is_valid_nonce = wp_verify_nonce( $nonce );

	// Get request values if nonce if valid
	if ( $is_valid_nonce ) {
		$api_key = isset( $_REQUEST['api_key'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['api_key'] ) ) : '';
		$secret = isset( $_REQUEST['secret'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['secret'] ) ) : '';
	}

	if ( $is_valid_nonce && $is_delete ) {
		delete_option( 'api_key' );
		delete_option( 'secret' );
	} elseif ( $is_valid_nonce && '' !== $api_key && '' !== $secret ) {
		// Update database with requested values
		$has_successfully_saved &= update_option( 'api_key', $api_key );
		$encrypted_secret = $api_key_utils->encrypt( $secret, null );
		$has_successfully_saved &= isset( $encrypted_secret ) ? update_option( 'secret', $encrypted_secret ) : false;
		$has_requested_save = true;
	} else {
		// Return any stored api key/secret values
		$api_key_opt = get_option( 'api_key', null );
		$api_key = isset( $api_key_opt ) ? $api_key_opt : '';
		$secret_opt = get_option( 'secret', null );
		$secret = isset( $secret_opt ) ? $api_key_utils->decrypt( $secret_opt, '' ) : '';
	}

	// Setup page request url
	$page_url = wp_nonce_url( menu_page_url( 'excelkits', false ) );

	// Setup controls
	$can_delete_credentials = '' !== $api_key || '' !== $secret;

	// Add admin menu page assets
	$handle = 'excelkits-blocks-admin';
	wp_enqueue_style( $handle, plugins_url( 'src/admin/styles.css', __FILE__ ), array(), '1.0.0' );
	wp_enqueue_script( $handle, plugins_url( 'src/admin/scripts.js', __FILE__ ), array(), '1.0.0', true );
	?>
	<header class="excelkits-masthead">
		<div class="excelkits-masthead__inside-container">
			<div class="excelkits-masthead__logo-container">
				<?php include EXCELKITS_BLOCKS_PLUGIN_DIR . 'src/admin/logo.svg'; ?>
			</div>
		</div>
	</header>

	<div class="excelkits-container">
		<form
			id="api-credentials-form"
			class="excelkits-card"
			data-page-url="<?php echo esc_attr( $page_url ); ?>">
			<div class="excelkits-section-header">
				<div class="excelkits-section-header__label">
					<span><?php echo esc_html__( 'Settings', 'excelkits-blocks' ); ?></span>
				</div>
			</div>
			<div class="excelkits-inside">
				<table cellspacing="0" class="excelkits-table">
					<tbody>
						<tr>
							<th class="excelkits-table-label" width="10%" align="left" scope="row">
								<label for="key"><?php echo esc_html__( 'API Key', 'excelkits-blocks' ); ?></label>
							</th>
							<td width="5%"></td>
							<td align="left">
								<input
									type="text"
									id="excelkits-api-key"
									name="api_key"
									value="<?php echo esc_attr( $api_key ); ?>" />
							</td>
						</tr>

						<tr>
							<th class="excelkits-table-label" width="10%" align="left" scope="row">
								<label for="key"><?php echo esc_html__( 'Secret', 'excelkits-blocks' ); ?></label>
							</th>
							<td width="5%"></td>
							<td align="left">
								<input
									id="excelkits-secret"
									type="password"
									name="secret"
									value="<?php echo esc_attr( $secret ); ?>" />
							</td>
						</tr>

						<tr>
							<th class="excelkits-table-label" width="10%" align="left" scope="row"></th>
							<td width="5%"></td>
							<td align="left">
								<?php if ( empty( $api_key ) ) { ?>
								<a href="https://excelkits.com/signup?setup_api_access=true" target="_blank"><?php echo esc_html__( 'Sign up here', 'excelkits-blocks' ); ?></a> <?php echo esc_html__( 'to get your Excelkits API Keys', 'excelkits-blocks' ); ?>
								<?php } else { ?>
									<a href="https://excelkits.com/account/api-keys" target="_blank"><?php echo esc_html__( 'Manage your API Keys here', 'excelkits-blocks' ); ?></a>
								<?php } ?>
							</td>
						</tr>
					</tbody>
				</table>

				<div class="excelkits-card-actions">
					<div class="excelkits-card-actions__delete">
						<?php if ( $can_delete_credentials ) { ?>
							<a href="<?php echo esc_attr( $page_url ); ?>&action=delete">
								<?php echo esc_html__( 'Delete Your Keys', 'excelkits-blocks' ); ?>
							</a>
						<?php } ?>
					</div>

					<div>
						<?php if ( $has_requested_save && $has_successfully_saved ) { ?>
							<span class="excelkits-success-text">
								<?php echo esc_html__( 'Successfully saved', 'excelkits-blocks' ); ?>
							</span>
						<?php } elseif ( $has_requested_save ) { ?>
							<span class="excelkits-error-text">
								<?php echo esc_html__( 'Saving failed, please try again.', 'excelkits-blocks' ); ?>
							</span>
						<?php } ?>
						<input
							type="submit"
							name="submit"
							id="submit"
							class="excelkits-button"
							value="<?php echo esc_attr__( 'Save Changes', 'excelkits-blocks' ); ?>" />
					</div>
				</div>
			</div>
		</form>
	</div>
	<?php
}

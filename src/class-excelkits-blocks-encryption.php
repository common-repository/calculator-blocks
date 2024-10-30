<?php
/**
 * Encryption utility
 *
 * @package excelkits-blocks
 */

/**
 * Class responsible for encrypting and decrypting data.
 */
class Excelkits_Blocks_Encryption {

	/**
	 * Key to use for encryption.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	private $key;

	/**
	 * Salt to use for encryption.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	private $salt;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->key  = $this->get_default_key();
		$this->salt = $this->get_default_salt();
	}

	/**
	 * Encrypts a value.
	 *
	 * If a user-based key is set, that key is used. Otherwise the default key is used.
	 *
	 * @param string $value Value to encrypt.
	 * @param mixed  $fallback_value value to return if encryption fails.
	 * @return string|bool Encrypted value, or false on failure.
	 */
	public function encrypt( $value, $fallback_value = false ) {
		if ( ! extension_loaded( 'openssl' ) ) {
			return $value;
		}

		$method = 'aes-256-ctr';
		$ivlen  = openssl_cipher_iv_length( $method );
		$iv     = openssl_random_pseudo_bytes( $ivlen );

		$raw_value = openssl_encrypt( $value . $this->salt, $method, $this->key, 0, $iv );
		if ( ! $raw_value ) {
			return $fallback_value;
		}

		return $this->str_to_hex( $iv . $raw_value );
	}

	/**
	 * Decrypts a value.
	 *
	 * If a user-based key is set, that key is used. Otherwise the default key is used.
	 *
	 * @param string $raw_value Value to decrypt.
	 * @param mixed  $fallback_value value to return if decryption fails.
	 * @return string|bool Decrypted value, or false on failure.
	 */
	public function decrypt( $raw_value, $fallback_value = false ) {
		if ( ! extension_loaded( 'openssl' ) ) {
			return $raw_value;
		}

		$raw_value = $this->hex_to_str( $raw_value );

		$method = 'aes-256-ctr';
		$ivlen  = openssl_cipher_iv_length( $method );
		$iv     = substr( $raw_value, 0, $ivlen );

		$raw_value = substr( $raw_value, $ivlen );

		$value = openssl_decrypt( $raw_value, $method, $this->key, 0, $iv );
		if ( ! $value || substr( $value, - strlen( $this->salt ) ) !== $this->salt ) {
			return $fallback_value;
		}

		return substr( $value, 0, - strlen( $this->salt ) );
	}

	/**
	 * Gets the default encryption key to use.
	 *
	 * @return string Default (not user-based) encryption key.
	 */
	private function get_default_key() {
		if ( defined( 'LOGGED_IN_KEY' ) && '' !== LOGGED_IN_KEY ) {
			return LOGGED_IN_KEY;
		}

		// If this is reached, you're either not on a live site or have a serious security issue.
		return 'this-is-a-fallback-key-but-not-secure';
	}

	/**
	 * Gets the default encryption salt to use.
	 *
	 * @return string Encryption salt.
	 */
	private function get_default_salt() {
		if ( defined( 'LOGGED_IN_SALT' ) && '' !== LOGGED_IN_SALT ) {
			return LOGGED_IN_SALT;
		}

		// If this is reached, you're either not on a live site or have a serious security issue.
		return 'this-is-a-fallback-salt-but-not-secure';
	}

	/**
	 * Convert a hexidecimal string to UTF-8
	 *
	 * @param  string $hex Hex encoded string.
	 * @return string      UTF-8 string.
	 */
	private function hex_to_str( $hex ) {
		return pack( 'H*', $hex );
	}

	/**
	 * Convert a UTF-8 string to Hexidecimal
	 *
	 * @param  string $str UTF-8 string.
	 * @return string      Hexidecimal string.
	 */
	private function str_to_hex( $str ) {
		$unpacked = unpack( 'H*', $str );
		return array_shift( $unpacked );
	}
}


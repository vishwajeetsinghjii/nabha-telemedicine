(function () {
'use strict';
/*
 * Nabha Telemedicine
 * Registration role selection
 *
 * This file ONLY handles navigation from the
 * account-type selection page.
 */

const ROLE_ROUTES = {
    PATIENT: 'patient-register.html',
    ASHA: 'asha-register.html',
    DOCTOR: 'doctor-register.html'
};


function navigateToRole(role) {

    const normalizedRole = String(role || '').trim().toUpperCase();

    const destination = ROLE_ROUTES[normalizedRole];

    if (!destination) {
        console.error(
            '[Registration] Unknown role:',
            role
        );

        return;
    }


    /*
     * Store the selection as a temporary registration hint.
     *
     * IMPORTANT:
     * This is NOT used for authorization.
     * The backend must determine and enforce the
     * actual account role.
     */
    try {

        sessionStorage.setItem(
            'registration_role',
            normalizedRole
        );

    } catch (error) {

        console.warn(
            '[Registration] Could not save role:',
            error
        );

    }


    console.log(
        `[Registration] Navigating to ${destination}`
    );


    window.location.assign(destination);
}


function initializeRoleCards() {

    const roleCards = document.querySelectorAll(
        '.registration-role-card[data-role]'
    );


    console.log(
        `[Registration] Found ${roleCards.length} role cards`
    );


    if (!roleCards.length) {

        console.error(
            '[Registration] No role cards found.'
        );

        return;
    }


    roleCards.forEach(function (card) {

        const role = card
            .getAttribute('data-role')
            .trim()
            .toUpperCase();


        /*
         * Make sure the role actually exists.
         */
        if (!ROLE_ROUTES[role]) {

            console.warn(
                '[Registration] Unsupported role:',
                role
            );

            return;
        }


        /*
         * Click handler
         */
        card.addEventListener(
            'click',
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                console.log(
                    `[Registration] Selected role: ${role}`
                );

                navigateToRole(role);
            }
        );


        /*
         * Keyboard accessibility
         *
         * The cards are already <button> elements,
         * so Enter and Space are naturally supported.
         *
         * We intentionally do NOT add another keydown
         * navigation handler because that could cause
         * duplicate navigation.
         */

    });

}


/*
 * The script is loaded at the bottom of register.html,
 * but DOMContentLoaded makes this safe even if the
 * script location changes later.
 */
if (document.readyState === 'loading') {

    document.addEventListener(
        'DOMContentLoaded',
        initializeRoleCards
    );

} else {

    initializeRoleCards();

}
})();

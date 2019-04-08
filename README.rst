========================
Digital Asset Management
========================

**IMPORTANT: This project is currently under development. We strongly advise against using this project in production environments.**

Assets
======

* Mockups: https://xd.adobe.com/view/f870af49-1519-4051-7a88-490e94fb7b0d-8e41/
* Icons: https://github.com/typo3/typo3.icons

Contributing to the Frontend
============================

The frontend is based on Vue.js, TypeScript and JSX-TypeScript (.tsx) templates. To contribute and make changes please adapt the files and use the commands described below within the :code:`./Build/Vue` directory to build the required modules.

Project Setup
-------------

.. code-block::

    yarn install


Compile Libary
--------------

To integrate with requirejs compile vue project as lib and manually copy it to extensions' resources dir.

.. code-block::

    yarn build-lib


Watch & Build Libary
--------------------

To integrate with requirejs compile vue project as lib and manually copy it to extensions' resources dir.

.. code-block::

    yarn watch-lib


Testing
=======

Head over to :code:`Build/Vue` and use yarn to test the frontend.

Linting and fixing files
------------------------

.. code-block::
    
    yarn run lint

Run end-to-end tests
--------------------

.. code-block::
    
    yarn run test:e2e

Run unit tests
--------------

.. code-block::

    yarn run test:unit


Code Quality
============

.. image:: https://travis-ci.org/TYPO3-Initiatives/digital-asset-management.svg?branch=master
   :alt: Build Status
   :target: https://travis-ci.org/TYPO3-Initiatives/digital-asset-management

.. image:: https://scrutinizer-ci.com/g/TYPO3-Initiatives/digital-asset-management/badges/quality-score.png?b=master
   :alt: Scrutinizer Code Quality
   :target: https://scrutinizer-ci.com/g/TYPO3-Initiatives/digital-asset-management/?branch=master
